/**
 * Cache Service - Redis Integration
 * Provides caching layer to reduce database load
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;
let isConnected = false;

// Default TTL values (in seconds)
const TTL = {
    SETTINGS: 300, // 5 minutes
    TAGS: 600, // 10 minutes
    AUTHORS: 600, // 10 minutes
    ARTICLES_LIST: 60, // 1 minute
    MEDIA_LIST: 120, // 2 minutes
    USER: 300 // 5 minutes
};

/**
 * Initialize Redis connection
 */
const initRedis = () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        logger.info('Redis URL not configured. Cache disabled.');
        return null;
    }

    try {
        redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            enableReadyCheck: true,
            lazyConnect: true
        });

        redis.on('connect', () => {
            isConnected = true;
            logger.info('Redis connected');
        });

        redis.on('error', (err) => {
            isConnected = false;
            logger.error('Redis error', { error: err.message });
        });

        redis.on('close', () => {
            isConnected = false;
            logger.warn('Redis connection closed');
        });

        // Attempt connection
        redis.connect().catch((err) => {
            logger.warn('Redis connection failed, cache disabled', { error: err.message });
            redis = null;
        });

        return redis;
    } catch (err) {
        logger.error('Failed to initialize Redis', { error: err.message });
        return null;
    }
};

/**
 * Check if cache is available
 */
const isAvailable = () => {
    return redis !== null && isConnected;
};

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} - Cached value or null
 */
const get = async (key) => {
    if (!isAvailable()) return null;

    try {
        const value = await redis.get(key);
        if (value) {
            return JSON.parse(value);
        }
        return null;
    } catch (err) {
        logger.error('Cache get error', { key, error: err.message });
        return null;
    }
};

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
const set = async (key, value, ttl = 300) => {
    if (!isAvailable()) return false;

    try {
        await redis.set(key, JSON.stringify(value), 'EX', ttl);
        return true;
    } catch (err) {
        logger.error('Cache set error', { key, error: err.message });
        return false;
    }
};

/**
 * Delete value from cache
 * @param {string} key - Cache key
 */
const del = async (key) => {
    if (!isAvailable()) return false;

    try {
        await redis.del(key);
        return true;
    } catch (err) {
        logger.error('Cache delete error', { key, error: err.message });
        return false;
    }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "settings:*")
 */
const delPattern = async (pattern) => {
    if (!isAvailable()) return false;

    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        return true;
    } catch (err) {
        logger.error('Cache delete pattern error', { pattern, error: err.message });
        return false;
    }
};

/**
 * Cache wrapper - get from cache or execute function
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 */
const wrap = async (key, fn, ttl = 300) => {
    // Try to get from cache
    const cached = await get(key);
    if (cached !== null) {
        return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await set(key, result, ttl);
    return result;
};

/**
 * Clear all cache
 */
const clear = async () => {
    if (!isAvailable()) return false;

    try {
        await redis.flushdb();
        logger.info('Cache cleared');
        return true;
    } catch (err) {
        logger.error('Cache clear error', { error: err.message });
        return false;
    }
};

/**
 * Get cache statistics
 */
const getStats = async () => {
    if (!isAvailable()) {
        return { available: false };
    }

    try {
        const info = await redis.info('stats');
        const keyCount = await redis.dbsize();

        return {
            available: true,
            connected: isConnected,
            keys: keyCount,
            info: info
        };
    } catch (err) {
        return { available: false, error: err.message };
    }
};

// Cache key generators
const keys = {
    settings: () => 'settings:all',
    setting: (key) => `settings:${key}`,
    tags: () => 'tags:all',
    authors: () => 'authors:all',
    articleTypes: () => 'articles:types',
    user: (id) => `user:${id}`
};

module.exports = {
    initRedis,
    isAvailable,
    get,
    set,
    del,
    delPattern,
    wrap,
    clear,
    getStats,
    keys,
    TTL
};
