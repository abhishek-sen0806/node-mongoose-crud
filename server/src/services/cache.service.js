import Redis from 'ioredis';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Redis Cache Service
 * Provides caching layer for improved performance
 * Falls back gracefully if Redis is unavailable
 */
class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 3600; // 1 hour in seconds
    this.prefix = 'app:';
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      const redisUrl = config.redis?.url || process.env.REDIS_URL;
      
      if (!redisUrl) {
        logger.warn('Redis URL not configured. Caching disabled.');
        return;
      }

      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      // Event handlers
      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        logger.error('Redis error:', { error: error.message });
        this.isConnected = false;
      });

      this.client.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', { error: error.message });
      this.client = null;
    }
  }

  /**
   * Get prefixed key
   * @param {string} key
   * @returns {string}
   */
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Get value from cache
   * @param {string} key
   * @returns {Promise<*>}
   */
  async get(key) {
    if (!this.isConnected || !this.client) return null;

    try {
      const data = await this.client.get(this.getKey(key));
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key
   * @param {*} value
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>}
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.setex(
        this.getKey(key),
        ttl,
        JSON.stringify(value)
      );
      return true;
    } catch (error) {
      logger.error('Cache set error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async del(key) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error('Cache delete error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern
   * @returns {Promise<number>}
   */
  async delByPattern(pattern) {
    if (!this.isConnected || !this.client) return 0;

    try {
      const keys = await this.client.keys(this.getKey(pattern));
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      logger.error('Cache pattern delete error:', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!this.isConnected || !this.client) return false;

    try {
      return await this.client.exists(this.getKey(key)) === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   * @param {string} key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {number} ttl
   * @returns {Promise<*>}
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache (don't await, fire and forget)
    this.set(key, data, ttl);
    
    return data;
  }

  /**
   * Increment counter
   * @param {string} key
   * @param {number} amount
   * @returns {Promise<number>}
   */
  async incr(key, amount = 1) {
    if (!this.isConnected || !this.client) return 0;

    try {
      return await this.client.incrby(this.getKey(key), amount);
    } catch (error) {
      logger.error('Cache incr error:', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Set expiry on existing key
   * @param {string} key
   * @param {number} ttl
   * @returns {Promise<boolean>}
   */
  async expire(key, ttl) {
    if (!this.isConnected || !this.client) return false;

    try {
      return await this.client.expire(this.getKey(key), ttl) === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Flush all cache
   * @returns {Promise<boolean>}
   */
  async flush() {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      logger.error('Cache flush error:', { error: error.message });
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

/**
 * Cache middleware factory
 * Caches GET request responses
 * @param {number} ttl - Cache TTL in seconds
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `route:${req.originalUrl}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, data, ttl);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

export default cache;

