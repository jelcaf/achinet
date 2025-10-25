import { BooleanFunction, RetryOptions } from './retry-options';

type RetryRequiredOptions = {
  maxRetries: number;
  delayMs: number;
  retryOn?: BooleanFunction;
};

function extractConfigValues(arg1: number | RetryOptions, arg2?: number): RetryRequiredOptions {
  let maxRetries: number;
  let delayMs: number;
  let retryOn: BooleanFunction | undefined;

  if (typeof arg1 === 'number') {
    // Overload 1: Retry(maxRetries: number)
    maxRetries = arg1;
    delayMs = typeof arg2 === 'number' ? arg2 : 0;
  } else {
    // Overload 3: Retry({ maxRetries: number, delayMs: number })
    maxRetries = arg1.maxRetries;
    delayMs = arg1.delayMs || 0;
    retryOn = arg1.retryOn as BooleanFunction;
  }

  return { maxRetries, delayMs, ...(retryOn && { retryOn }) };
}

export function Retry(maxRetries: number);

export function Retry(maxRetries: number, delayMs: number);

export function Retry(retryOptions: RetryOptions);

export function Retry(arg1: number | { maxRetries: number; delayMs?: number }, arg2?: number) {
  const config = extractConfigValues(arg1, arg2);

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    // eslint-disable-next-line no-param-reassign,consistent-return
    descriptor.value = async function (...args: any[]): Promise<any> {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i <= config.maxRetries; i++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = await originalMethod.apply(this, args);
          if (config.retryOn && config.retryOn(undefined, result)) {
            // eslint-disable-next-line
            continue;
          }
          return result;
        } catch (err) {
          if ((config.retryOn && !config.retryOn(err)) || i === config.maxRetries) {
            throw err;
          }
          // eslint-disable-next-line
          await new Promise((resolve) => setTimeout(resolve, config.delayMs));
        }
      }
    };
    return descriptor;
  };
}
