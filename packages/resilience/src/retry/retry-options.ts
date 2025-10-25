export type BooleanFunction = (error, result?: () => unknown) => boolean;

export type RetryOptions = {
  maxRetries: number;
  delayMs?: number;
  retryOn?: BooleanFunction;
};
