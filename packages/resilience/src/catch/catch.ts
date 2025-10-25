export type Handler = (err: any, context: any, ...args: any) => any;

// eslint-disable-next-line consistent-return
async function handleError(ctx: any, errorClass: any, handler: Handler, error: any) {
  // check if error is instance of passed error class
  if (typeof handler === 'function' && error instanceof errorClass) {
    return handler.call(null, error, ctx);
  }
  throw error;
}

const emptyHandler = () => {};

export function Catch(errorClass: any, handler?: Handler) {
  const finalHandler = handler ?? emptyHandler;
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line no-param-reassign,consistent-return
    descriptor.value = async function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);
        if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
          return result.catch(async (error: any) => {
            return handleError(this, errorClass, finalHandler, error);
          });
        }
        return result;
      } catch (error) {
        return handleError(this, errorClass, finalHandler, error);
      }
    };
    return descriptor;
  };
}
