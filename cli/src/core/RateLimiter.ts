/**
 * Rate Limiter
 * Throttles requests to CalDAV providers to avoid rate limiting
 * Implements exponential backoff for 429 responses
 */

export class RateLimiter {
  private lastRequestTime = 0;
  private minInterval: number; // milliseconds between requests
  private requestsPerSecond: number;

  /**
   * @param requestsPerSecond - Maximum requests per second (default: 2 for safety)
   */
  constructor(requestsPerSecond: number = 2) {
    this.requestsPerSecond = requestsPerSecond;
    this.minInterval = 1000 / requestsPerSecond; // ms
  }

  /**
   * Throttle a request - waits if needed to respect rate limit
   * Call this before making each request
   */
  async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.minInterval) {
      const waitTime = this.minInterval - elapsed;
      await this.sleep(waitTime);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Exponential backoff for rate limit errors (429 responses)
   * @param attempt - Current retry attempt (0-based)
   * @param maxAttempts - Maximum retry attempts (default: 5)
   * @returns Wait time in milliseconds, or null if max attempts exceeded
   */
  static getBackoffDelay(attempt: number, maxAttempts: number = 5): number | null {
    if (attempt >= maxAttempts) {
      return null; // Max retries exceeded
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Cap at 30 seconds
  }

  /**
   * Execute a function with automatic retry on 429 rate limit errors
   * @param fn - Async function to execute
   * @param maxAttempts - Maximum retry attempts (default: 5)
   * @returns Result of the function
   * @throws Error if max retries exceeded or non-retryable error occurs
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 5
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Throttle before each attempt
        await this.throttle();

        // Execute function
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error (429)
        if (this.isRateLimitError(error)) {
          const backoffDelay = RateLimiter.getBackoffDelay(attempt, maxAttempts);
          if (backoffDelay === null) {
            throw new Error(
              `Rate limit exceeded after ${maxAttempts} attempts: ${lastError.message}`
            );
          }

          console.warn(
            `Rate limit hit (attempt ${attempt + 1}/${maxAttempts}), waiting ${backoffDelay}ms...`
          );
          await this.sleep(backoffDelay);
        } else {
          // Non-retryable error, throw immediately
          throw error;
        }
      }
    }

    throw new Error(
      `Failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Check if error is a rate limit error (HTTP 429)
   * @param error - Error object to check
   * @returns true if rate limit error
   */
  private isRateLimitError(error: unknown): boolean {
    if (error && typeof error === 'object') {
      // Check for Response object with status 429
      if ('status' in error && error.status === 429) {
        return true;
      }

      // Check for error message containing "429" or "rate limit"
      if ('message' in error && typeof error.message === 'string') {
        const msg = error.message.toLowerCase();
        return msg.includes('429') || msg.includes('rate limit');
      }
    }

    return false;
  }

  /**
   * Sleep utility
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update rate limit (requests per second)
   * @param requestsPerSecond - New rate limit
   */
  setRateLimit(requestsPerSecond: number): void {
    this.requestsPerSecond = requestsPerSecond;
    this.minInterval = 1000 / requestsPerSecond;
  }

  /**
   * Get current rate limit
   * @returns Requests per second
   */
  getRateLimit(): number {
    return this.requestsPerSecond;
  }
}

/**
 * Provider-specific rate limit presets
 */
export const ProviderRateLimits = {
  google: 2, // Conservative: 2 requests/sec (well below 5 req/sec limit)
  nextcloud: 10, // No documented limit, be respectful
  baikal: 10, // No documented limit, be respectful
  generic: 5, // Safe default for unknown providers
};
