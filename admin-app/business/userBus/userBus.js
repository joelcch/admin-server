const { DuplicateUserError, UserDoesNotExistError, AuthenticationError } = require('./errors');
const { DuplicateEntryError, InvalidCredentialsError } = require('./data/errors');

const userBus = (store) => {
    const userStore = store;

    const registerTeacher = async (email) => {
        try {
            await userStore.registerTeacher(email);
        } catch (err) {
            if (err instanceof DuplicateEntryError) {
                throw new DuplicateUserError();
            }
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const registerStudent = async (email) => {
        try {
            await userStore.registerStudent(email);
        } catch (err) {
            if (err instanceof DuplicateEntryError) {
                throw new DuplicateUserError();
            }
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const getTeacherIdByEmail = async (email) => {
        try {
            return await userStore.getTeacherIdByEmail(email);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const registerTeacherStudentMap = async (teacherEmail, studentEmails) => {
        // Try to register the teacher, if duplicate means teacher already exists
        try {
            await userStore.registerTeacher(teacherEmail);
        } catch (err) {
            if (!(err instanceof DuplicateEntryError)) {
                throw err;
            }
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
        }

        const studentPromises = studentEmails.map(async (studentEmail) => {
            // Try to register the student, if duplicate means student already exists
            try {
                await userStore.registerStudent(studentEmail);
            } catch (err) {
                if (!(err instanceof DuplicateEntryError)) {
                    throw err;
                }
                if (err instanceof InvalidCredentialsError) {
                    throw new AuthenticationError();
                }
            }
            
            // Assign student to teacher
            try {
                await userStore.assignStudentToTeacher(teacherEmail, studentEmail);
            } catch (err) {
                if (!(err instanceof DuplicateEntryError)) {
                    throw err;
                }
                if (err instanceof InvalidCredentialsError) {
                    throw new AuthenticationError();
                }
            }
        });

        await Promise.all(studentPromises);
    }

    const getCommonStudentsFromTeachers = async (teacherEmails) => {
        let invalidEmails = [];
        try {
            const teacherRecords = await userStore.getTeacherIdsByEmails(teacherEmails);
            const existingEmails = teacherRecords.map(record => record.email);

            // Identify invalid emails
            for (const email of teacherEmails) {
                if (!existingEmails.includes(email)) {
                    invalidEmails.push(email);
                }
            }
            if (invalidEmails.length > 0) {
                throw new UserDoesNotExistError(`1 or more teachers do not exist.`, invalidEmails);
            }
            return await userStore.getCommonStudentsByTeacherIds(teacherEmails);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const suspendStudent = async (email) => {
        try {
            const student_id = await userStore.getStudentIdByEmail(email);
            if (!student_id) {
                throw new UserDoesNotExistError('student does not exist');
            }
        } catch (err) {
            throw err;
        }
        try {
            await userStore.suspendStudentByEmail(email);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const getNotifiableStudents = async (teacherEmail, mentionedStudents) => {
        try {
            return await userStore.getNotifiableStudentsByTeacherEmailAndMentions(teacherEmail, mentionedStudents);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    return {
        registerTeacher,
        registerStudent,
        getTeacherIdByEmail,
        registerTeacherStudentMap,
        getCommonStudentsFromTeachers,
        suspendStudent,
        getNotifiableStudents,
    }
}

module.exports = userBus;