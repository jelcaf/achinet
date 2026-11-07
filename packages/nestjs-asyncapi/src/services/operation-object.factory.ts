import { getSchemaPath } from '@nestjs/swagger';
import { AsyncApiOperationOptionsRaw, AsyncMessageObject, AsyncOperationObject, OneOfMessageType } from '../interface';

export class OperationObjectFactory {
  create(
    operation: AsyncApiOperationOptionsRaw,
    produces: string[],
    models: Set<Function>,
  ): AsyncOperationObject {
    const { message } = operation;
    const { oneOf } = message as OneOfMessageType;

    if (oneOf) {
      return {
        ...operation,
        message: {
          oneOf: oneOf.map((i) => ({
            ...i,
            payload: {
              $ref: this.registerPayloadModel(i as AsyncMessageObject, models),
            },
          })),
        },
      };
    }

    return {
      ...operation,
      message: {
        ...operation.message,
        payload: {
          $ref: this.registerPayloadModel(message as AsyncMessageObject, models),
        },
      },
    };
  }

  /**
   * Registers the payload class so its schema is generated later, and returns its `$ref`.
   */
  private registerPayloadModel(message: AsyncMessageObject, models: Set<Function>): string {
    if (!message.payload || !message.payload.type) {
      throw new Error('Async message payload or payload.type is undefined; ensure message.payload is provided.');
    }
    const messagePayloadType = message.payload.type as Function;
    models.add(messagePayloadType);
    return getSchemaPath(messagePayloadType);
  }
}
