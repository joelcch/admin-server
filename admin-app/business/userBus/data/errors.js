class StoreError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class DuplicateEntryError extends StoreError {
    constructor(message) {
        super(message || 'duplicate entry error', 409); // 409 Conflict
    }
}

class InvalidCredentialsError extends StoreError {
    constructor(message) {
        super(message || 'invalid credentials', 401); // 401 Unauthorized
    }
}

const handleDbError = (err) => {
    if (err.code === 'ER_DUP_ENTRY') {
        throw new DuplicateEntryError();
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new InvalidCredentialsError();
    }
    throw err;
};

module.exports = {
    StoreError,
    DuplicateEntryError,
    InvalidCredentialsError,
};