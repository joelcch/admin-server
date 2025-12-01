class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class InvalidEmailError extends AppError {
    constructor(email) {
        super(`Invalid email: ${email}`, 400);
    }
}       

class MultipleInvalidEmailError extends AppError {
    constructor(emails) {
        super(`Invalid emails: ${emails.join(', ')}`, 400);
    }
}

class InvalidRequestBodyError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class UnexpectedError extends AppError {
    constructor(message) {
        super(message || 'An unexpected error occurred', 500);
    }
}

module.exports = {
    AppError,
    InvalidEmailError,
    InvalidRequestBodyError,
    MultipleInvalidEmailError,
    UnexpectedError
};