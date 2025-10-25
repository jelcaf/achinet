# Resilience

This module contains utilities for building resilient applications.

## Installation

To install this module using Yarn, run the following command:

```sh
yarn add @quantum/resilience
```


## Usage

### `Retry`

The retry decorator is used to automatically retry a function if it fails. It takes two parameters: maxRetries and delayMs.

```typescript
import { Retry } from '@quantum/resilience';

class MyService {
  @Retry({ maxRetries: 3, delayMs: 1000 })
  async fetchData() {
    const response = await fetch('https://example.com/data');

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    return response.json();
  }
}
```

In this example, we're using the `Retry` decorator to automatically retry the `fetchData` method of the MyService class up to 3 times with a 1 second delay between retries if it fails. If the method still fails after the specified number of retries, an exception will be thrown.

You can customize the number of retries and the delay between retries by adjusting the maxRetries and delayMs parameters to the retry decorator.

The retry function has the following parameters:

- `maxRetries`: The maximum number of times to retry the function if it fails.
- `delayMs`: The delay in milliseconds between each retry.
- `retryOn`: Function with error, response parameters to decide if retry is necessary. 

### `CircuitBreaker`

The circuitBreaker decorator is used to protect a function from being called when a downstream service is unavailable. It takes no parameters.`

```typescript
import { CircuitBreaker } from '@quantum/resilience';

class MyService {
  @CircuitBreaker()
  async fetchData() {
    // ...
  }
}
```
In this example, we're using the `CircuitBreaker` decorator to protect the fetchData method of the MyService class from being called if a downstream service is unavailable.

The `CircuitBreaker` decorator uses the circuitBreakerExternal utility function from the circuit-breaker-js library to implement the circuit breaker pattern.

The circuit breaker uses the following options (we can not modify currently):

- `halfOpenAfter`: The time in milliseconds that the circuit breaker should remain in the "open" state before transitioning to the "half-open" state (default: 10 * 1000).
- `breaker`: The circuit breaker implementation to use (default: ConsecutiveBreaker(5)).

## Contributing
If you would like to contribute to this module, please open a pull request on the GitHub repository.
