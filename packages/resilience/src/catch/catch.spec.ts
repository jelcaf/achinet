// eslint-disable-next-line max-classes-per-file
import { Catch } from '../index';

class MyError extends Error {}

class Sample {
  loggerFn() {}

  @Catch(MyError, () => {})
  async methodCatchMyErrorException() {
    throw new MyError('my_error');
  }

  @Catch(Error, () => {})
  async methodCatchErrorException() {
    throw new MyError('error');
  }

  @Catch(MyError, () => {})
  async methodNotCatchErrorException() {
    throw new Error('error');
  }

  @Catch(MyError, (err, ctx) => ctx.loggerFn(err, 'MyError'))
  @Catch(Error, (err, ctx) => ctx.loggerFn(err, 'Error'))
  async methodWithSeveralCatchException() {
    throw new Error('error');
  }

  @Catch(Error, () => 'this')
  async methidWithCatchReturn() {
    throw new Error('error');
  }
}

describe('Catch decorator', () => {
  it('Catch Error class', async () => {
    const sample = new Sample();
    await expect(() => sample.methodCatchMyErrorException()).not.toThrowError();
  });

  it('Catch MyError class', async () => {
    const sample = new Sample();
    await expect(() => sample.methodCatchErrorException()).not.toThrowError();
  });

  it('Can not cach Error class', async () => {
    const sample = new Sample();
    await expect(() => sample.methodNotCatchErrorException()).rejects.toThrow(Error);
  });

  it('Catch several errors class', async () => {
    const sample = new Sample();
    const spyLoggerFn = jest.spyOn(sample, 'loggerFn');
    await expect(() => sample.methodWithSeveralCatchException()).not.toThrowError();
    expect(spyLoggerFn).toHaveBeenCalledWith(expect.any(Error), 'Error');
  });

  it('Catch clause set the method result', async () => {
    const sample = new Sample();

    const result = await sample.methidWithCatchReturn();
    expect(result).toEqual('this');
  });
});
