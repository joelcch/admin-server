class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class DuplicateUserError extends AppError {
    constructor(message) {
        super(message || 'User with this username already exists.', 409); // 409 Conflict
    }
}

class UserDoesNotExistError extends AppError {
    constructor(message, emails) {
        super(message || 'User with this username already exists.', 409); // 409 Conflict
        this.emails = emails;
    }
}

module.exports = {
    AppError,
    DuplicateUserError,
    UserDoesNotExistError,
};
