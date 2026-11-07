import { INestApplication, INestApplicationContext } from '@nestjs/common';
import { DocumentBuilder, SchemaObject, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

/**
 * Module that never exists in the app container. Passing it as `include`
 * makes swagger skip HTTP route scanning, so only `extraModels` are processed.
 */
class NoRoutesSentinelModule {}

/**
 * Builds JSON schemas for DTO classes (decorated with `@ApiProperty`, etc.)
 * using only the public API of `@nestjs/swagger`.
 */
export class SwaggerSchemaFactory {
  public generate(
    app: INestApplicationContext,
    models: Function[],
    options: SwaggerDocumentOptions = {},
  ): Record<string, SchemaObject> {
    if (models.length === 0) {
      return {};
    }

    const document = SwaggerModule.createDocument(this.toSwaggerHost(app), new DocumentBuilder().build(), {
      ...options,
      include: [NoRoutesSentinelModule],
      extraModels: models,
      deepScanRoutes: false,
    });

    return (document.components?.schemas ?? {}) as Record<string, SchemaObject>;
  }

  /**
   * Swagger expects an HTTP application (it calls `getHttpAdapter().getType()`).
   * Microservice-only contexts don't have one, so a stub adapter is provided.
   */
  private toSwaggerHost(app: INestApplicationContext): INestApplication {
    if (typeof (app as Partial<INestApplication>).getHttpAdapter === 'function') {
      return app as INestApplication;
    }

    const stubAdapter = { getType: (): string => 'none' };
    return new Proxy(app, {
      get: (target, prop): unknown =>
        prop === 'getHttpAdapter' ? (): typeof stubAdapter => stubAdapter : Reflect.get(target, prop, target),
    }) as INestApplication;
  }
}
