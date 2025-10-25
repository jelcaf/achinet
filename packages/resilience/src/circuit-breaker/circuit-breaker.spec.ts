import { CircuitBreaker } from '../index';

jest.useFakeTimers();

describe('Circuit breaker tests', () => {
  let sample;

  beforeEach(() => {
    class Sample {
      async simpleMethod(): Promise<boolean> {
        return true;
      }

      @CircuitBreaker()
      async circuitBreakerMethod(): Promise<boolean> {
        return this.simpleMethod();
      }
    }

    sample = new Sample();
  });

  it('Run only once if method run correctly', async () => {
    const retryMethodSpy = jest.spyOn(sample, 'circuitBreakerMethod');
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    await sample.circuitBreakerMethod();

    expect(retryMethodSpy).toBeCalledTimes(1);
    expect(simpleMethodSpy).toBeCalledTimes(1);
  });

  it('Circuit breaker is open after five errors', async () => {
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    const error = new Error('sample');
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 5; i++) {
      simpleMethodSpy.mockRejectedValueOnce(error);
      // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
      await expect(async () => sample.circuitBreakerMethod()).rejects.toThrowError(error);
    }

    // Circuit should be open, then error
    const serviceUnavailableError = new Error('service unavailable');
    await expect(async () => sample.circuitBreakerMethod()).rejects.toThrowError(serviceUnavailableError);
  });

  it('Open circuit is closed after 10 * 1000', async () => {
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    const error = new Error('sample');
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 5; i++) {
      simpleMethodSpy.mockRejectedValueOnce(error);
      // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
      await expect(async () => sample.circuitBreakerMethod()).rejects.toThrowError(error);
    }

    // Circuit should be open, then error
    const serviceUnavailableError = new Error('service unavailable');
    await expect(async () => sample.circuitBreakerMethod()).rejects.toThrowError(serviceUnavailableError);

    // Wait for timeout to elapse
    jest.advanceTimersByTime(10 * 1000);

    const result = await sample.circuitBreakerMethod();
    expect(result).toBeTruthy();
  });
});
