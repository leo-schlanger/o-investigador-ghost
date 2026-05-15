const jwt = require('jsonwebtoken');
const { protect, authorize, checkArticleOwnership } = require('../authMiddleware');

// Mock the config
jest.mock('../../config/env', () => ({
    getJwtSecret: jest.fn(() => 'test-secret-key')
}));

describe('authMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('protect', () => {
        it('should call next() with valid token', async () => {
            const token = jwt.sign(
                { id: 1, email: 'test@test.com', role: 'admin' },
                'test-secret-key'
            );
            req.headers.authorization = `Bearer ${token}`;

            await protect(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(1);
            expect(req.user.email).toBe('test@test.com');
        });

        it('should return 401 if no authorization header', async () => {
            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Acesso nao autorizado. Faca login para continuar.'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 401 if authorization header does not start with Bearer', async () => {
            req.headers.authorization = 'Basic sometoken';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Acesso nao autorizado. Faca login para continuar.'
            });
        });

        it('should return 401 with invalid token', async () => {
            req.headers.authorization = 'Bearer invalid-token';

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token invalido. Faca login novamente.'
            });
        });

        it('should return 401 with expired token', async () => {
            // Create an expired token
            const token = jwt.sign(
                { id: 1, email: 'test@test.com' },
                'test-secret-key',
                { expiresIn: '-1h' } // Expired 1 hour ago
            );
            req.headers.authorization = `Bearer ${token}`;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Sessao expirada. Faca login novamente.'
            });
        });

        it('should return 401 with token signed with wrong secret', async () => {
            const token = jwt.sign({ id: 1 }, 'wrong-secret');
            req.headers.authorization = `Bearer ${token}`;

            await protect(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Token invalido. Faca login novamente.'
            });
        });
    });

    describe('authorize', () => {
        it('should call next() when user has required role', () => {
            req.user = { id: 1, role: 'admin' };
            const middleware = authorize('admin', 'editor');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should call next() when user has one of multiple allowed roles', () => {
            req.user = { id: 1, role: 'editor' };
            const middleware = authorize('admin', 'editor');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 403 when user does not have required role', () => {
            req.user = { id: 1, role: 'viewer' };
            const middleware = authorize('admin', 'editor');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User role viewer is not authorized to access this route'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 when req.user is undefined', () => {
            req.user = undefined;
            const middleware = authorize('admin');

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User role none is not authorized to access this route'
            });
        });

        it('should work with single role authorization', () => {
            req.user = { id: 1, role: 'admin' };
            const middleware = authorize('admin');

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('checkArticleOwnership', () => {
        let mockGhostApi;

        beforeEach(() => {
            mockGhostApi = {
                getPost: jest.fn()
            };
            req.params = { id: 'post-123' };
        });

        it('should allow admin to modify any article', async () => {
            req.user = { id: 1, role: 'admin', email: 'admin@test.com' };
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(mockGhostApi.getPost).not.toHaveBeenCalled();
        });

        it('should allow editor to modify any article', async () => {
            req.user = { id: 2, role: 'editor', email: 'editor@test.com' };
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(mockGhostApi.getPost).not.toHaveBeenCalled();
        });

        it('should allow author to modify their own article', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            mockGhostApi.getPost.mockResolvedValue({
                id: 'post-123',
                authors: [{ email: 'author@test.com' }, { email: 'other@test.com' }]
            });
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(mockGhostApi.getPost).toHaveBeenCalledWith('post-123');
        });

        it('should block author from modifying another users article', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            mockGhostApi.getPost.mockResolvedValue({
                id: 'post-123',
                authors: [{ email: 'other@test.com' }]
            });
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should handle case-insensitive email matching', async () => {
            req.user = { id: 3, role: 'author', email: 'Author@Test.COM' };
            mockGhostApi.getPost.mockResolvedValue({
                id: 'post-123',
                authors: [{ email: 'author@test.com' }]
            });
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 404 when article not found', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            mockGhostApi.getPost.mockRejectedValue(new Error('Resource not found'));
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 500 on unexpected errors', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            mockGhostApi.getPost.mockRejectedValue(new Error('Connection failed'));
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('should return 400 when article ID is missing', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            req.params = {};
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should block author when article has no authors', async () => {
            req.user = { id: 3, role: 'author', email: 'author@test.com' };
            mockGhostApi.getPost.mockResolvedValue({
                id: 'post-123',
                authors: []
            });
            const middleware = checkArticleOwnership(mockGhostApi);

            await middleware(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
