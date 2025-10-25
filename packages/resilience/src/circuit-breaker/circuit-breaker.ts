import { handleAll, circuitBreaker as circuitBreakerExternal, ConsecutiveBreaker, BrokenCircuitError } from 'cockatiel';

export function CircuitBreaker() {
  // Break if more than 5 requests in a row fail:
  const breaker = circuitBreakerExternal(handleAll, {
    halfOpenAfter: 10 * 1000,
    breaker: new ConsecutiveBreaker(5),
  });

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async function (...args: any[]) {
      try {
        const result = await breaker.execute(async () => {
          return originalMethod.apply(this, args);
        });
        return result;
      } catch (error) {
        if (error instanceof BrokenCircuitError) {
          throw new Error('service unavailable');
        }
        throw error;
      }
    };

    return descriptor;
  };
}
