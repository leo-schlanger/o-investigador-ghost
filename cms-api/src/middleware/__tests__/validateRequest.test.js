const Joi = require('joi');
const { validateBody, validateQuery } = require('../validateRequest');

describe('validateRequest middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    describe('validateBody', () => {
        const schema = Joi.object({
            name: Joi.string().min(2).required(),
            email: Joi.string().email().required()
        });

        it('should call next() for valid body', () => {
            req.body = { name: 'John', email: 'john@test.com' };
            validateBody(schema)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should strip unknown fields', () => {
            req.body = { name: 'John', email: 'john@test.com', extra: 'field' };
            validateBody(schema)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.body).not.toHaveProperty('extra');
        });

        it('should return 400 for invalid body', () => {
            req.body = { name: 'J' }; // name too short, email missing
            validateBody(schema)(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            const response = res.json.mock.calls[0][0];
            expect(response.success).toBe(false);
            expect(response.error.message).toBe('Validation failed');
            expect(response.error.errors).toHaveLength(2);
        });

        it('should return all validation errors (abortEarly: false)', () => {
            req.body = {};
            validateBody(schema)(req, res, next);
            const response = res.json.mock.calls[0][0];
            expect(response.error.errors.length).toBeGreaterThanOrEqual(2);
        });

        it('should include field names in errors', () => {
            req.body = { name: '' };
            validateBody(schema)(req, res, next);
            const response = res.json.mock.calls[0][0];
            const fields = response.error.errors.map(e => e.field);
            expect(fields).toContain('name');
            expect(fields).toContain('email');
        });
    });

    describe('validateQuery', () => {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10)
        });

        it('should call next() for valid query', () => {
            req.query = { page: '2', limit: '20' };
            validateQuery(schema)(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should apply defaults for missing fields', () => {
            req.query = {};
            validateQuery(schema)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.query.page).toBe(1);
            expect(req.query.limit).toBe(10);
        });

        it('should return 400 for invalid query', () => {
            req.query = { page: '-1' };
            validateQuery(schema)(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should strip unknown query params', () => {
            req.query = { page: '1', unknown: 'value' };
            validateQuery(schema)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.query).not.toHaveProperty('unknown');
        });
    });
});
