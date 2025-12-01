class BusError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class DuplicateUserError extends BusError {
    constructor(message) {
        super(message || 'User with this username already exists.', 409); // 409 Conflict
    }
}

class UserDoesNotExistError extends BusError {
    constructor(message, emails) {
        super(message || 'User with this username already exists.', 409); // 409 Conflict
        this.emails = emails;
    }
}

class AuthenticationError extends BusError {
    constructor(message) {
        super(message || 'Store authentication error occurred.', 500); // 500 Internal Server Error
    }
}

module.exports = {
    BusError,
    DuplicateUserError,
    UserDoesNotExistError,
    AuthenticationError,
};
