export interface RateLimitOptions {
  capacity: number;
  refillRate: number;
  intervalMs?: number;
}

interface TokenBucketState {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  capacity: 60,
  refillRate: 60,
  intervalMs: 60_000,
};

const buckets = new Map<string, TokenBucketState>();

function refillTokens(state: TokenBucketState, now: number, options: Required<RateLimitOptions>) {
  const elapsed = now - state.lastRefill;

  if (elapsed <= 0) {
    return;
  }

  const tokensToAdd = (elapsed / options.intervalMs) * options.refillRate;
  state.tokens = Math.min(options.capacity, state.tokens + tokensToAdd);
  state.lastRefill = now;
}

export function consumeRateLimit(key: string, providedOptions?: Partial<RateLimitOptions>): RateLimitResult {
  const options: Required<RateLimitOptions> = {
    capacity: providedOptions?.capacity ?? DEFAULT_OPTIONS.capacity,
    refillRate: providedOptions?.refillRate ?? DEFAULT_OPTIONS.refillRate,
    intervalMs: providedOptions?.intervalMs ?? DEFAULT_OPTIONS.intervalMs,
  };

  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: options.capacity, lastRefill: now };

  refillTokens(bucket, now, options);

  const allowed = bucket.tokens >= 1;

  if (allowed) {
    bucket.tokens -= 1;
  }

  buckets.set(key, bucket);

  const tokensUntilNext = allowed ? bucket.tokens : 1 - bucket.tokens;
  const resetInMs = (tokensUntilNext / options.refillRate) * options.intervalMs;

  return {
    allowed,
    limit: options.capacity,
    remaining: Math.max(0, Math.floor(bucket.tokens)),
    resetInSeconds: Math.max(1, Math.ceil(resetInMs / 1000)),
  };
}
