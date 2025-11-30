class DbError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class DuplicateEntryError extends DbError {
    constructor(message) {
        super(message || 'duplicate entry error', 409); // 409 Conflict
    }
}

module.exports = {
    DbError,
    DuplicateEntryError,
};