const { csrfProtection, csrfOriginOnly, validateOrigin } = require('../csrfMiddleware');

describe('csrfMiddleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        // Save original env
        process.env.CORS_ORIGIN = 'http://localhost:5173,http://localhost:3001';

        mockReq = {
            method: 'POST',
            path: '/api/articles',
            get: jest.fn()
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('csrfProtection', () => {
        it('should allow GET requests without validation', () => {
            mockReq.method = 'GET';

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should allow HEAD requests without validation', () => {
            mockReq.method = 'HEAD';

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow OPTIONS requests without validation', () => {
            mockReq.method = 'OPTIONS';

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow public login endpoint', () => {
            mockReq.path = '/api/auth/login';
            mockReq.get.mockReturnValue(null);

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow public register endpoint', () => {
            mockReq.path = '/api/auth/register';
            mockReq.get.mockReturnValue(null);

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow public contact endpoint', () => {
            mockReq.path = '/api/contact';
            mockReq.get.mockReturnValue(null);

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow requests with valid origin and X-Requested-With header', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject requests with invalid origin', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://evil.com';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Requisicao bloqueada: origem nao autorizada',
                code: 'CSRF_ORIGIN_INVALID'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should reject requests without X-Requested-With header', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Requisicao bloqueada: header de seguranca ausente',
                code: 'CSRF_HEADER_MISSING'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should allow requests without Origin header (same-origin)', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should validate using Referer when Origin is not present', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Referer') return 'http://localhost:5173/dashboard';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject invalid Referer', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Referer') return 'http://evil.com/page';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });

    describe('csrfOriginOnly', () => {
        it('should allow GET requests', () => {
            mockReq.method = 'GET';

            csrfOriginOnly(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow valid origin without X-Requested-With', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                return null;
            });

            csrfOriginOnly(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should reject invalid origin', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://evil.com';
                return null;
            });

            csrfOriginOnly(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });

    describe('validateOrigin', () => {
        it('should return true for valid origin', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                return null;
            });

            expect(validateOrigin(mockReq)).toBe(true);
        });

        it('should return false for invalid origin', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://evil.com';
                return null;
            });

            expect(validateOrigin(mockReq)).toBe(false);
        });

        it('should return true when no CORS_ORIGIN is set', () => {
            delete process.env.CORS_ORIGIN;

            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://any-origin.com';
                return null;
            });

            expect(validateOrigin(mockReq)).toBe(true);
        });

        it('should handle empty CORS_ORIGIN', () => {
            process.env.CORS_ORIGIN = '';

            mockReq.get.mockReturnValue('http://any-origin.com');

            expect(validateOrigin(mockReq)).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle malformed Origin URL gracefully', () => {
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'not-a-valid-url';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });

        it('should work with PUT method', () => {
            mockReq.method = 'PUT';
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should work with DELETE method', () => {
            mockReq.method = 'DELETE';
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should work with PATCH method', () => {
            mockReq.method = 'PATCH';
            mockReq.get.mockImplementation((header) => {
                if (header === 'Origin') return 'http://localhost:5173';
                if (header === 'X-Requested-With') return 'XMLHttpRequest';
                return null;
            });

            csrfProtection(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });
});
