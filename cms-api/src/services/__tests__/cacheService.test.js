// Mock ioredis before require
jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        connect: jest.fn().mockResolvedValue(true),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
        flushdb: jest.fn(),
        info: jest.fn(),
        dbsize: jest.fn()
    }));
});

jest.mock('../../utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));

// Reset module state between tests
let cacheService;
beforeEach(() => {
    jest.resetModules();
    cacheService = require('../cacheService');
});

describe('cacheService', () => {
    describe('TTL constants', () => {
        it('should have correct TTL values', () => {
            expect(cacheService.TTL.SETTINGS).toBe(300);
            expect(cacheService.TTL.TAGS).toBe(600);
            expect(cacheService.TTL.ARTICLES_LIST).toBe(60);
            expect(cacheService.TTL.MEDIA_LIST).toBe(120);
            expect(cacheService.TTL.USER).toBe(300);
        });
    });

    describe('key generators', () => {
        it('should generate correct cache keys', () => {
            expect(cacheService.keys.settings()).toBe('settings:all');
            expect(cacheService.keys.setting('theme')).toBe('settings:theme');
            expect(cacheService.keys.tags()).toBe('tags:all');
            expect(cacheService.keys.authors()).toBe('authors:all');
            expect(cacheService.keys.user('abc-123')).toBe('user:abc-123');
        });
    });

    describe('isAvailable', () => {
        it('should return false when redis is not initialized', () => {
            expect(cacheService.isAvailable()).toBe(false);
        });
    });

    describe('get/set/del when unavailable', () => {
        it('get should return null when unavailable', async () => {
            const result = await cacheService.get('test-key');
            expect(result).toBeNull();
        });

        it('set should return false when unavailable', async () => {
            const result = await cacheService.set('test-key', 'value');
            expect(result).toBe(false);
        });

        it('del should return false when unavailable', async () => {
            const result = await cacheService.del('test-key');
            expect(result).toBe(false);
        });

        it('delPattern should return false when unavailable', async () => {
            const result = await cacheService.delPattern('test:*');
            expect(result).toBe(false);
        });

        it('clear should return false when unavailable', async () => {
            const result = await cacheService.clear();
            expect(result).toBe(false);
        });
    });

    describe('wrap', () => {
        it('should execute function when cache is unavailable', async () => {
            const fn = jest.fn().mockResolvedValue({ data: 'fresh' });
            const result = await cacheService.wrap('test-key', fn, 300);
            expect(fn).toHaveBeenCalled();
            expect(result).toEqual({ data: 'fresh' });
        });
    });

    describe('getStats when unavailable', () => {
        it('should return available: false', async () => {
            const stats = await cacheService.getStats();
            expect(stats).toEqual({ available: false });
        });
    });

    describe('initRedis', () => {
        it('should return null when REDIS_URL not set', () => {
            delete process.env.REDIS_URL;
            const result = cacheService.initRedis();
            expect(result).toBeNull();
        });
    });
});
