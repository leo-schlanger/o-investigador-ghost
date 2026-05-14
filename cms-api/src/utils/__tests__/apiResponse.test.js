const { success, error, validationError, notFound, unauthorized, forbidden } = require('../apiResponse');

describe('apiResponse', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('success', () => {
        it('should return 200 with data by default', () => {
            success(res, { id: 1, name: 'test' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 1, name: 'test' }
            });
        });

        it('should return custom status code', () => {
            success(res, { id: 1 }, 201);
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should handle null data', () => {
            success(res, null);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: null
            });
        });

        it('should handle array data', () => {
            success(res, [1, 2, 3]);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [1, 2, 3]
            });
        });
    });

    describe('error', () => {
        it('should return 500 by default', () => {
            error(res, 'Something went wrong');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Something went wrong' }
            });
        });

        it('should return custom status code', () => {
            error(res, 'Bad request', 400);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should include errors array when provided', () => {
            const errors = [{ field: 'email', message: 'Invalid email' }];
            error(res, 'Validation failed', 400, errors);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Validation failed',
                    errors: [{ field: 'email', message: 'Invalid email' }]
                }
            });
        });

        it('should not include errors key when null', () => {
            error(res, 'Server error');
            const response = res.json.mock.calls[0][0];
            expect(response.error).not.toHaveProperty('errors');
        });
    });

    describe('validationError', () => {
        it('should return 400 with validation errors', () => {
            const errors = [
                { field: 'name', message: 'Name is required' },
                { field: 'email', message: 'Invalid email' }
            ];
            validationError(res, 'Validation failed', errors);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Validation failed',
                    errors
                }
            });
        });
    });

    describe('notFound', () => {
        it('should return 404 with default message', () => {
            notFound(res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Resource not found' }
            });
        });

        it('should return 404 with custom resource name', () => {
            notFound(res, 'Article');
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Article not found' }
            });
        });
    });

    describe('unauthorized', () => {
        it('should return 401 with default message', () => {
            unauthorized(res);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Unauthorized' }
            });
        });

        it('should return 401 with custom message', () => {
            unauthorized(res, 'Token expired');
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Token expired' }
            });
        });
    });

    describe('forbidden', () => {
        it('should return 403 with default message', () => {
            forbidden(res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: { message: 'Forbidden' }
            });
        });
    });
});
