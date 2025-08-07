/* eslint-disable max-params */
/* eslint-disable max-statements */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
  priority: 'low' | 'medium' | 'high';
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'low' | 'medium' | 'high';
  persistToDisk?: boolean;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  memoryUsage: number;
}

class ApiCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly CACHE_PREFIX = '@lumen_cache:';
  private readonly MAX_MEMORY_ENTRIES = 1000;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache metrics
  private hits = 0;
  private misses = 0;
  private totalRequests = 0;

  // Cache TTL strategies based on data type
  private readonly TTL_STRATEGIES = {
    // Stable data - longer cache times
    'crypto-list': 10 * 60 * 1000, // 10 minutes for market data
    'crypto-detail': 15 * 60 * 1000, // 15 minutes for detailed coin info
    'crypto-search': 30 * 60 * 1000, // 30 minutes for search results

    // Dynamic data - shorter cache times
    'price-data': 2 * 60 * 1000, // 2 minutes for price data
    'market-stats': 5 * 60 * 1000, // 5 minutes for market stats

    // User data - very short cache
    'user-portfolio': 1 * 60 * 1000, // 1 minute for user data
  } as const;

  private generateCacheKey(
    key: string,
    params?: Record<string, unknown>,
  ): string {
    if (!params) return key;

    const sortedParams: Record<string, unknown> = {};
    for (const paramKey of Object.keys(params).sort()) {
      sortedParams[paramKey] = params[paramKey];
    }

    return `${key}:${JSON.stringify(sortedParams)}`;
  }

  private getTTLForKey(key: string, customTtl?: number): number {
    if (customTtl) return customTtl;

    for (const [pattern, ttl] of Object.entries(this.TTL_STRATEGIES)) {
      if (key.includes(pattern)) {
        return ttl;
      }
    }

    return this.DEFAULT_TTL;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private shouldPersist(options?: CacheOptions): boolean {
    return options?.persistToDisk ?? false;
  }

  private async getFromDisk(cacheKey: string): Promise<CacheEntry | undefined> {
    try {
      const diskKey = `${this.CACHE_PREFIX}${cacheKey}`;
      const cached = await AsyncStorage.getItem(diskKey);

      if (!cached) return undefined;

      const entry: CacheEntry = JSON.parse(cached);

      if (this.isExpired(entry)) {
        await AsyncStorage.removeItem(diskKey);
        return undefined;
      }

      return entry;
    } catch (error) {
      console.warn('[Cache] Error reading from disk:', error);
      return undefined;
    }
  }

  private async saveToDisk(cacheKey: string, entry: CacheEntry): Promise<void> {
    try {
      const diskKey = `${this.CACHE_PREFIX}${cacheKey}`;
      await AsyncStorage.setItem(diskKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('[Cache] Error saving to disk:', error);
    }
  }

  private evictLRU(): void {
    if (this.memoryCache.size <= this.MAX_MEMORY_ENTRIES) return;

    let oldestKey = '';
    let oldestAccess = Date.now();

    for (const [key, entry] of this.memoryCache) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  async get<T>(
    key: string,
    params?: Record<string, unknown>,
  ): Promise<T | null> {
    this.totalRequests++;

    const cacheKey = this.generateCacheKey(key, params);

    // Try memory cache first
    let entry = this.memoryCache.get(cacheKey);

    if (entry && !this.isExpired(entry)) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      this.hits++;
      return entry.data as T;
    }

    // Try disk cache if not in memory
    if (!entry) {
      entry = await this.getFromDisk(cacheKey);

      if (entry && !this.isExpired(entry)) {
        // Move back to memory cache
        entry.accessCount++;
        entry.lastAccessed = Date.now();
        this.memoryCache.set(cacheKey, entry);
        this.evictLRU();
        this.hits++;
        return entry.data as T;
      }
    }

    this.misses++;
    return null;
  }

  async set<T>(
    key: string,
    data: T,
    params?: Record<string, unknown>,
    options?: CacheOptions,
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(key, params);
    const ttl = this.getTTLForKey(key, options?.ttl);
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      priority: options?.priority ?? 'medium',
      accessCount: 1,
      lastAccessed: now,
    };

    // Always store in memory
    this.memoryCache.set(cacheKey, entry);
    this.evictLRU();

    // Optionally persist to disk
    if (this.shouldPersist(options)) {
      await this.saveToDisk(cacheKey, entry);
    }
  }

  async invalidate(
    key: string,
    params?: Record<string, unknown>,
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(key, params);

    // Remove from memory
    this.memoryCache.delete(cacheKey);

    // Remove from disk
    try {
      const diskKey = `${this.CACHE_PREFIX}${cacheKey}`;
      await AsyncStorage.removeItem(diskKey);
    } catch (error) {
      console.warn('[Cache] Error removing from disk:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate memory cache
    const keysToDelete = Array.from(this.memoryCache.keys()).filter((key) =>
      key.includes(pattern),
    );

    for (const key of keysToDelete) this.memoryCache.delete(key);

    // Invalidate disk cache
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(
        (key) => key.startsWith(this.CACHE_PREFIX) && key.includes(pattern),
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('[Cache] Error invalidating pattern from disk:', error);
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear disk cache
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((key) =>
        key.startsWith(this.CACHE_PREFIX),
      );

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.warn('[Cache] Error clearing disk cache:', error);
    }

    // Reset metrics
    this.hits = 0;
    this.misses = 0;
    this.totalRequests = 0;
  }

  getMetrics(): CacheMetrics {
    const hitRate = this.totalRequests > 0 ? this.hits / this.totalRequests : 0;
    const missRate =
      this.totalRequests > 0 ? this.misses / this.totalRequests : 0;

    // Estimate memory usage (rough calculation)
    let memoryUsage = 0;
    for (const entry of this.memoryCache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // Rough UTF-16 estimation
    }

    return {
      hitRate,
      missRate,
      totalRequests: this.totalRequests,
      cacheSize: this.memoryCache.size,
      memoryUsage,
    };
  }

  // Pre-warm cache with critical data
  async warmCache(
    key: string,
    dataLoader: () => Promise<unknown>,
    params?: Record<string, unknown>,
    options?: CacheOptions,
  ): Promise<void> {
    try {
      const cached = await this.get(key, params);

      if (!cached) {
        const data = await dataLoader();
        await this.set(key, data, params, options);
      }
    } catch (error) {
      console.warn('[Cache] Error warming cache:', error);
    }
  }

  // Batch operations for efficiency
  async batchGet<T>(
    requests: Array<{ key: string; params?: Record<string, unknown> }>,
  ): Promise<Array<T | null>> {
    return Promise.all(
      requests.map(({ key, params }) => this.get<T>(key, params)),
    );
  }

  async batchSet<T>(
    items: Array<{
      key: string;
      data: T;
      params?: Record<string, unknown>;
      options?: CacheOptions;
    }>,
  ): Promise<void> {
    await Promise.all(
      items.map(({ key, data, params, options }) =>
        this.set(key, data, params, options),
      ),
    );
  }
}

export const apiCacheService = new ApiCacheService();
