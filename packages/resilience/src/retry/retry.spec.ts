import { Retry } from '../index';

const sampleErrorMessage = 'sample error message';

class Sample {
  async simpleMethod(): Promise<boolean> {
    return true;
  }

  @Retry({ maxRetries: 3 })
  async retryMethod(): Promise<boolean> {
    return this.simpleMethod();
  }

  @Retry({ maxRetries: 3, retryOn: () => false })
  async retryOnFalseMethod(): Promise<boolean> {
    return this.simpleMethod();
  }

  @Retry({ maxRetries: 3, retryOn: () => true })
  async retryOnTrueMethod(): Promise<boolean> {
    return this.simpleMethod();
  }

  @Retry({ maxRetries: 3, retryOn: (error) => error.message === sampleErrorMessage })
  async retryOnBaseOnErrorMethod(): Promise<boolean> {
    return this.simpleMethod();
  }

  @Retry({ maxRetries: 3, retryOn: (error, result) => (result as unknown as boolean) === true })
  async retryOnBaseOnResponseMethod(): Promise<boolean> {
    return this.simpleMethod();
  }
}

describe('Retry tests', () => {
  it('Run only once if method run correctly', async () => {
    const sample = new Sample();
    const retryMethodSpy = jest.spyOn(sample, 'retryMethod');
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    await sample.retryMethod();

    expect(retryMethodSpy).toBeCalledTimes(1);
    expect(simpleMethodSpy).toBeCalledTimes(1);
  });

  it('Method failed twice and then runs correctly', async () => {
    const sample = new Sample();
    const retryMethodSpy = jest.spyOn(sample, 'retryMethod');
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    const error = new Error('sample');
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);

    await sample.retryMethod();

    expect(retryMethodSpy).toBeCalledTimes(1);
    expect(simpleMethodSpy).toBeCalledTimes(3);
  });

  it('Return error after retry exceded (retry = 1 calls)', async () => {
    const sample = new Sample();
    const retryMethodSpy = jest.spyOn(sample, 'retryMethod');
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    const error = new Error('sample');
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);

    await expect(async () => sample.retryMethod()).rejects.toThrowError(new Error('sample'));

    expect(retryMethodSpy).toBeCalledTimes(1);
    expect(simpleMethodSpy).toBeCalledTimes(4);
  });

  it('Do not retry if retryOn return false', async () => {
    const sample = new Sample();
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    await sample.retryOnFalseMethod();

    expect(simpleMethodSpy).toBeCalledTimes(1);
  });

  it('Retry if retryOn return true', async () => {
    const sample = new Sample();
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    await sample.retryOnTrueMethod();

    expect(simpleMethodSpy).toBeCalledTimes(4);
  });

  it('Retry if retryOn based on the error', async () => {
    const sample = new Sample();
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    const error = new Error(sampleErrorMessage);
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);
    simpleMethodSpy.mockRejectedValueOnce(error);

    await expect(() => sample.retryOnBaseOnErrorMethod()).rejects.toThrowError(new Error(sampleErrorMessage));

    expect(simpleMethodSpy).toBeCalledTimes(4);
  });

  it('Retry if retryOn based on the response', async () => {
    const sample = new Sample();
    const simpleMethodSpy = jest.spyOn(sample, 'simpleMethod');

    simpleMethodSpy.mockResolvedValue(true);

    await sample.retryOnBaseOnResponseMethod();

    expect(simpleMethodSpy).toBeCalledTimes(4);
  });
});
