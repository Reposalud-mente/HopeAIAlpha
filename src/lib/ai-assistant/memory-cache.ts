/**
 * Memory Cache for caching memory operations
 * This module provides a cache for memory operations to improve performance
 */

export interface MemoryCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of cache entries
}

export interface MemoryCacheEntry<T> {
  data: T;
  timestamp: number;
}

export class MemoryCache<T> {
  private cache: Map<string, MemoryCacheEntry<T>>;
  private ttl: number;
  private maxSize: number;

  constructor(options: MemoryCacheOptions = {}) {
    this.cache = new Map<string, MemoryCacheEntry<T>>();
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes by default
    this.maxSize = options.maxSize || 100; // 100 entries by default
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to cache
   */
  set(key: string, value: T): void {
    // Evict entries if the cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  /**
   * Delete a value from the cache
   * @param key The cache key
   * @returns True if the entry was deleted, false otherwise
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache
   * @returns The number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Evict the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestKey = key;
        oldestTimestamp = entry.timestamp;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

// Create a singleton instance
let memoryCacheInstance: MemoryCache<any> | null = null;

/**
 * Get the singleton instance of the MemoryCache
 * @param options Options for the memory cache
 * @returns The MemoryCache instance
 */
export function getMemoryCache<T>(options: MemoryCacheOptions = {}): MemoryCache<T> {
  if (!memoryCacheInstance) {
    memoryCacheInstance = new MemoryCache<T>(options);
  }

  return memoryCacheInstance as MemoryCache<T>;
}
