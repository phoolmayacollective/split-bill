/**
 * Minimal in-memory sliding-window rate limiter. Per server instance only —
 * good enough to keep a scraper from burning the free Gemini quota without
 * adding infrastructure.
 */

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimiter = {
  check: (key: string, now?: number) => boolean;
};

export function createRateLimiter({
  limit,
  windowMs,
}: RateLimitOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now: number = Date.now()): boolean {
      const windowStart = now - windowMs;
      const recent = (hits.get(key) ?? []).filter(
        (timestamp) => timestamp > windowStart,
      );

      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }

      recent.push(now);
      hits.set(key, recent);

      // Drop stale keys so the map doesn't grow unbounded.
      if (hits.size > 10_000) {
        for (const [existingKey, timestamps] of hits) {
          if (timestamps.every((timestamp) => timestamp <= windowStart)) {
            hits.delete(existingKey);
          }
        }
      }

      return true;
    },
  };
}

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
