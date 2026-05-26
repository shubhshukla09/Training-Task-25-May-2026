// Cache Entry Types
interface CacheEntry {
  value: any;
  expiresAt: number;
}

// In-Memory Cache Store
const cacheStore = new Map<string, CacheEntry>();

// Active garbage collection of expired keys
if (typeof global !== "undefined") {
  const globalInterval = global as any;
  if (!globalInterval.__cacheCleanupInterval) {
    globalInterval.__cacheCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of cacheStore.entries()) {
        if (entry.expiresAt < now) {
          cacheStore.delete(key);
        }
      }
    }, 60000); // Clean up every 1 minute
  }
}

// Caching interface with TTL support
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = cacheStore.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      cacheStore.delete(key);
      return null;
    }

    return entry.value as T;
  },

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string): Promise<void> {
    cacheStore.delete(key);
  },

  async clear(): Promise<void> {
    cacheStore.clear();
  }
};

// Sliding Window Rate Limiter
// Stores timestamps of requests for each IP address
const rateLimitStore = new Map<string, number[]>();

export const rateLimiter = {
  async limit(
    ip: string,
    limitCount: number,
    windowSeconds: number
  ): Promise<{ success: boolean; limit: number; remaining: number }> {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const timestamps = rateLimitStore.get(ip) || [];

    // Filter out timestamps outside the sliding window
    const activeTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (activeTimestamps.length >= limitCount) {
      // Over limit
      rateLimitStore.set(ip, activeTimestamps);
      return {
        success: false,
        limit: limitCount,
        remaining: 0,
      };
    }

    // Add current request timestamp
    activeTimestamps.push(now);
    rateLimitStore.set(ip, activeTimestamps);

    return {
      success: true,
      limit: limitCount,
      remaining: Math.max(0, limitCount - activeTimestamps.length),
    };
  },
};
