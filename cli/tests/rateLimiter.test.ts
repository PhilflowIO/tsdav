/**
 * Unit Tests for RateLimiter
 */

import { RateLimiter, ProviderRateLimits } from '../src/core/RateLimiter';

describe('RateLimiter', () => {
  describe('constructor', () => {
    it('should initialize with default rate limit', () => {
      const limiter = new RateLimiter();
      expect(limiter.getRateLimit()).toBe(2);
    });

    it('should initialize with custom rate limit', () => {
      const limiter = new RateLimiter(5);
      expect(limiter.getRateLimit()).toBe(5);
    });
  });

  describe('throttle', () => {
    it('should throttle sequential requests', async () => {
      const limiter = new RateLimiter(10); // 10 req/s = 100ms interval

      const start = Date.now();

      await limiter.throttle();
      await limiter.throttle();
      await limiter.throttle();

      const elapsed = Date.now() - start;

      // Should take at least 200ms (2 intervals of 100ms each)
      expect(elapsed).toBeGreaterThanOrEqual(180); // Allow 20ms tolerance
    }, 10000);

    it('should not throttle if enough time has passed', async () => {
      const limiter = new RateLimiter(10); // 100ms interval

      await limiter.throttle();

      // Wait longer than interval
      await new Promise(resolve => setTimeout(resolve, 150));

      const start = Date.now();
      await limiter.throttle();
      const elapsed = Date.now() - start;

      // Should be instant (no waiting needed)
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('setRateLimit', () => {
    it('should update rate limit', () => {
      const limiter = new RateLimiter(2);
      expect(limiter.getRateLimit()).toBe(2);

      limiter.setRateLimit(10);
      expect(limiter.getRateLimit()).toBe(10);
    });
  });

  describe('getBackoffDelay', () => {
    it('should return exponential backoff delays', () => {
      expect(RateLimiter.getBackoffDelay(0)).toBe(1000);   // 1s
      expect(RateLimiter.getBackoffDelay(1)).toBe(2000);   // 2s
      expect(RateLimiter.getBackoffDelay(2)).toBe(4000);   // 4s
      expect(RateLimiter.getBackoffDelay(3)).toBe(8000);   // 8s
      expect(RateLimiter.getBackoffDelay(4)).toBe(16000);  // 16s
    });

    it('should cap backoff at 30 seconds', () => {
      expect(RateLimiter.getBackoffDelay(4, 10)).toBe(16000); // 16s
      expect(RateLimiter.getBackoffDelay(5, 10)).toBe(30000); // Cap at 30s
    });

    it('should return null after max attempts', () => {
      expect(RateLimiter.getBackoffDelay(5, 5)).toBeNull();
      expect(RateLimiter.getBackoffDelay(10, 5)).toBeNull();
    });
  });

  describe('executeWithRetry', () => {
    it('should execute function successfully on first attempt', async () => {
      const limiter = new RateLimiter(10);
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await limiter.executeWithRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on rate limit error (429)', async () => {
      const limiter = new RateLimiter(10);

      const mockFn = jest.fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limit exceeded' })
        .mockResolvedValue('success');

      const result = await limiter.executeWithRetry(mockFn, 3);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2); // Failed once, succeeded on retry
    }, 10000);

    it('should throw after max retries', async () => {
      const limiter = new RateLimiter(10);

      const mockFn = jest.fn().mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded'
      });

      await expect(limiter.executeWithRetry(mockFn, 3)).rejects.toThrow(
        'Failed after 3 attempts'
      );

      expect(mockFn).toHaveBeenCalledTimes(3);
    }, 15000);

    it('should not retry on non-retryable errors', async () => {
      const limiter = new RateLimiter(10);

      const mockFn = jest.fn().mockRejectedValue(new Error('Not found'));

      await expect(limiter.executeWithRetry(mockFn)).rejects.toThrow('Not found');

      expect(mockFn).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('ProviderRateLimits', () => {
    it('should have correct provider limits', () => {
      expect(ProviderRateLimits.google).toBe(2);     // Conservative for Google
      expect(ProviderRateLimits.nextcloud).toBe(10); // No documented limit
      expect(ProviderRateLimits.baikal).toBe(10);    // No documented limit
      expect(ProviderRateLimits.generic).toBe(5);    // Safe default
    });
  });
});
