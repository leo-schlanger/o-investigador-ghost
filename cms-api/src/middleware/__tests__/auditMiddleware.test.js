const { auditLog } = require('../auditMiddleware');

// Mock the models
jest.mock('../../models', () => ({
    AuditLog: {
        create: jest.fn().mockResolvedValue({})
    }
}));

jest.mock('../../utils/logger', () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
}));

describe('auditMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { id: 'user-123', name: 'Test User', email: 'test@test.com' },
            params: { id: 'resource-456' },
            body: {},
            ip: '127.0.0.1',
            connection: { remoteAddress: '127.0.0.1' }
        };
        res = {
            statusCode: 200,
            json: jest.fn()
        };
        next = jest.fn();
    });

    it('should call next() immediately', async () => {
        const middleware = auditLog('create', 'article');
        await middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    it('should log on successful response (2xx)', async () => {
        const db = require('../../models');
        const middleware = auditLog('create', 'article');
        await middleware(req, res, next);

        // Simulate response
        res.statusCode = 201;
        res.json({ id: 'new-article' });

        // Wait for async persist
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(db.AuditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-123',
                userName: 'Test User',
                action: 'create',
                resource: 'article',
                resourceId: 'resource-456',
                ip: '127.0.0.1'
            })
        );
    });

    it('should not log on error response (4xx/5xx)', async () => {
        const db = require('../../models');
        const middleware = auditLog('create', 'article');
        await middleware(req, res, next);

        res.statusCode = 400;
        res.json({ error: 'Bad request' });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(db.AuditLog.create).not.toHaveBeenCalled();
    });

    it('should use custom getResourceId', async () => {
        const db = require('../../models');
        const middleware = auditLog('update', 'user', {
            getResourceId: (req) => req.body.userId
        });
        req.body = { userId: 'custom-id' };
        await middleware(req, res, next);

        res.statusCode = 200;
        res.json({ success: true });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(db.AuditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                resourceId: 'custom-id'
            })
        );
    });

    it('should use custom getDetails', async () => {
        const db = require('../../models');
        const middleware = auditLog('login', 'auth', {
            getDetails: (req) => ({ email: req.body.email })
        });
        req.body = { email: 'test@test.com' };
        await middleware(req, res, next);

        res.statusCode = 200;
        res.json({ token: 'abc' });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(db.AuditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                details: { email: 'test@test.com' }
            })
        );
    });

    it('should handle null user gracefully', async () => {
        const db = require('../../models');
        req.user = null;
        const middleware = auditLog('register', 'auth');
        await middleware(req, res, next);

        res.statusCode = 201;
        res.json({ id: 'new-user' });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(db.AuditLog.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: null,
                userName: null
            })
        );
    });

    it('should not crash if AuditLog.create fails', async () => {
        const db = require('../../models');
        db.AuditLog.create.mockRejectedValueOnce(new Error('DB error'));
        const logger = require('../../utils/logger');

        const middleware = auditLog('delete', 'article');
        await middleware(req, res, next);

        res.statusCode = 200;
        res.json({ message: 'deleted' });

        await new Promise(resolve => setTimeout(resolve, 10));

        expect(logger.error).toHaveBeenCalled();
    });
});
