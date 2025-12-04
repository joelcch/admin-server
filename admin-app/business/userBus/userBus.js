const { DuplicateUserError, UserDoesNotExistError, AuthenticationError } = require('./errors');
const { DuplicateEntryError, InvalidCredentialsError } = require('./data/errors');

const userBus = (store) => {
        const userStore = store;
    
        const registerTeacherStudentMap = async (teacherEmail, studentEmails) => {
        // Try to register the teacher, if duplicate means teacher already exists
        try {
            await userStore.registerTeacher(teacherEmail);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            if (!(err instanceof DuplicateEntryError)) {
                throw err;
            }
        }

        // Bulk register all students
        // Skip if no students provided
        if (studentEmails.length === 0) {
            return;
        }
        
        try {
            await userStore.registerStudentsBulk(studentEmails);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
            
        // Assign all students to teacher in bulk (ignores duplicates)
        try {
            await userStore.assignStudentsToTeacherBulk(teacherEmail, studentEmails);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    const getCommonStudentsFromTeachers = async (teacherEmails) => {
        let invalidEmails = [];
        try {
            const teacherRecords = await userStore.getTeachersByEmails(teacherEmails);
            const existingEmails = new Set(teacherRecords.map(record => record.email));

            // Identify invalid emails
            teacherEmails.forEach(email => {
                if (!existingEmails.has(email)) {
                    invalidEmails.push(email);
                }
            });

            if (invalidEmails.length > 0) {
                throw new UserDoesNotExistError(`1 or more teachers do not exist.`, invalidEmails);
            }

            return await userStore.getCommonStudentsByTeacherEmails(teacherEmails);
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
            const teacherRecords = await userStore.getTeachersByEmails([teacherEmail]);
            if (teacherRecords.length === 0) {
                throw new UserDoesNotExistError('teacher does not exist');
            }

            return await userStore.getNotifiableStudentsByTeacherEmailAndMentions(teacherEmail, mentionedStudents);
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new AuthenticationError();
            }
            throw err;
        }
    }

    return {
        registerTeacherStudentMap,
        getCommonStudentsFromTeachers,
        suspendStudent,
        getNotifiableStudents,
    }
}

module.exports = userBus;