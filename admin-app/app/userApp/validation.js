const { InvalidEmailError, InvalidRequestBodyError, MultipleInvalidEmailError } = require("../../foundation/errDisplay/errDisplay");

var emailValidator = require("email-validator");

const validateRegisterRequest = (req) => {
    const { teacher, students } = req.body;
    if (!teacher) {
        throw new InvalidRequestBodyError('teacher email required');
    }

    // Validate emails
    if (!emailValidator.validate(teacher)) {
        throw new InvalidEmailError(teacher);
    }

    let invalidStudentEmails = [];
    if (!Array.isArray(students)) {
        throw new InvalidRequestBodyError('students must be an array');
    }

    // Validate individual student emails
    students.forEach(email => {
        if (!emailValidator.validate(email)) {
            invalidStudentEmails.push(email);
        }
    })

    if (invalidStudentEmails.length > 0) {
        throw new MultipleInvalidEmailError(invalidStudentEmails);
    }
}

const validateCommonStudentsRequest = (req) => {
    const teacherEmails = [].concat(req.query.teacher);
    if (!teacherEmails) {
        throw new InvalidRequestBodyError('at least one teacher email is required');
    }

    // Validate emails
    let invalidTeacherEmails = [];
    teacherEmails.forEach(email => {
        if (!emailValidator.validate(email)) {
            invalidTeacherEmails.push(email);
        }
    })

    if (invalidTeacherEmails.length > 0) {
        throw new MultipleInvalidEmailError(invalidTeacherEmails);
    }
}

const validateSuspendRequest = (req) => {
    const { student } = req.body;

    if (!student) {
        throw new InvalidRequestBodyError('student email required');
    }

    // Validate email
    if (!emailValidator.validate(student)) {
        throw new InvalidEmailError(student);
    }
}


const validateNotifiableRequest = (req) => {
    const { teacher, notification } = req.body;

    if (!teacher) {
        throw new InvalidRequestBodyError('teacher email required');
    }

    // Validate email
    if (!emailValidator.validate(teacher)) {
        throw new InvalidEmailError(teacher);
    }

    if (!notification) {
        throw new InvalidRequestBodyError('notification message required');
    }

    if (typeof notification !== 'string' || notification.trim() === '') {
        throw new InvalidRequestBodyError('empty notification message');
    }
}

module.exports = {
    validateRegisterRequest,
    validateCommonStudentsRequest,
    validateSuspendRequest,
    validateNotifiableRequest,
};