/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all endpoints
 */

/**
 * Send a success response
 * @param {object} res - Express response
 * @param {*} data - Response data
 * @param {number} [status=200] - HTTP status code
 */
const success = (res, data, status = 200) => {
    return res.status(status).json({
        success: true,
        data
    });
};

/**
 * Send an error response
 * @param {object} res - Express response
 * @param {string} message - Error message
 * @param {number} [status=500] - HTTP status code
 * @param {Array} [errors=null] - Detailed validation errors
 */
const error = (res, message, status = 500, errors = null) => {
    const response = {
        success: false,
        error: { message }
    };
    if (errors) {
        response.error.errors = errors;
    }
    return res.status(status).json(response);
};

/**
 * Send a validation error response (400)
 * @param {object} res - Express response
 * @param {string} message - Summary message
 * @param {Array} errors - Array of { field, message } objects
 */
const validationError = (res, message, errors = []) => {
    return error(res, message, 400, errors);
};

/**
 * Send a not found response (404)
 * @param {object} res - Express response
 * @param {string} [resource='Resource'] - Name of the resource
 */
const notFound = (res, resource = 'Resource') => {
    return error(res, `${resource} not found`, 404);
};

/**
 * Send an unauthorized response (401)
 * @param {object} res - Express response
 * @param {string} [message='Unauthorized'] - Error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
    return error(res, message, 401);
};

/**
 * Send a forbidden response (403)
 * @param {object} res - Express response
 * @param {string} [message='Forbidden'] - Error message
 */
const forbidden = (res, message = 'Forbidden') => {
    return error(res, message, 403);
};

module.exports = {
    success,
    error,
    validationError,
    notFound,
    unauthorized,
    forbidden
};
