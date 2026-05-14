/**
 * Request Validation Middleware
 * Uses Joi schemas to validate request body, query, and params
 */
const { validationError } = require('../utils/apiResponse');

/**
 * Create validation middleware for request body
 * @param {import('joi').Schema} schema - Joi schema
 * @param {object} [options] - Joi validation options
 * @returns {Function} Express middleware
 */
const validateBody = (schema, options = {}) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            ...options
        });

        if (error) {
            const errors = error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
            }));
            return validationError(res, 'Validation failed', errors);
        }

        req.body = value;
        next();
    };
};

/**
 * Create validation middleware for query parameters
 * @param {import('joi').Schema} schema - Joi schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
            }));
            return validationError(res, 'Invalid query parameters', errors);
        }

        req.query = value;
        next();
    };
};

module.exports = {
    validateBody,
    validateQuery
};
