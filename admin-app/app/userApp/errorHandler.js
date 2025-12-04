const { UserDoesNotExistError } = require('../../business/userBus/errors');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (err.isOperational) {
        // Operational, trusted error: send message to client
        const response = {
            error: err.message
        };

        // Include additional fields for specific errors
        if (err instanceof UserDoesNotExistError && err.emails) {
            response.emails = err.emails;
        }

        return res.status(err.statusCode).json(response);
    }
    console.error('Error', err);
    // Programming or other unknown error: don't leak details
    return res.status(500).json({
        error: 'unexpected error occurred'
    });
};

module.exports = errorHandler;