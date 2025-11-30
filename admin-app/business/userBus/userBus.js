const { DuplicateUserError, UserDoesNotExistError } = require('./errors');
const { DuplicateEntryError } = require('./data/errors');

const userBus = (store) => {
    const userStore = store;

    const registerTeacher = async (email) => {
        try {
            await userStore.registerTeacher(email);
        } catch (err) {
            if (err instanceof DuplicateEntryError) {
                throw new DuplicateUserError();
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
            throw err;
        }
    }

    const getTeacherIdByEmail = async (email) => {
        try {
            return await userStore.getTeacherIdByEmail(email);
        } catch (err) {
            console.error('Error in getTeacherIdByEmail:', err);
            throw err;
        }
    }

    const registerTeacherStudentMap = async (teacherEmail, studentEmails) => {
        // Try to register the teacher, if duplicate means teacher already exists
        try {
            await userStore.registerTeacher(teacherEmail);
            console.log(`Registered teacher: ${teacherEmail}`);
        } catch (err) {
            if (!(err instanceof DuplicateEntryError)) {
                throw err;
            }
            console.log(`Teacher already exists: ${teacherEmail}`);
        }

        // Assign each student to the teacher
        for (const studentEmail of studentEmails) {
            // Try to register the student, if duplicate means student already exists
            try {
                await userStore.registerStudent(studentEmail);
                console.log(`Registered student: ${studentEmail}`);
            } catch (err) {
                if (!(err instanceof DuplicateEntryError)) {
                    throw err;
                }
                console.log(`Student already exists: ${studentEmail}`);
            }
            
            // Assign student to teacher
            try {
                await userStore.assignStudentToTeacher(teacherEmail, studentEmail);
            } catch (err) {
                if (!(err instanceof DuplicateEntryError)) {
                    throw err;
                }
                console.log(`Student ${studentEmail} already assigned to teacher ${teacherEmail}`);
            }
        }
    }

    const getCommonStudentsFromTeachers = async (teacherEmails) => {
        let invalidEmails = [];
        try {
            for (const email of teacherEmails) {
                try {
                    const teacher_id = await userStore.getTeacherIdByEmail(email);
                    if (!teacher_id) {
                        invalidEmails.push(email);
                        continue;
                    }
                } catch (err) {
                    throw err;
                }
            }
            if (invalidEmails.length > 0) {
                throw new UserDoesNotExistError(`1 or more teachers do not exist.`, invalidEmails);
            }
            return await userStore.getCommonStudentsByTeacherIds(teacherEmails);
        } catch (err) {
            console.error('Error in getCommonStudentsFromTeachers:', err);
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
            console.error('Error in suspendStudent:', err);
            throw err;
        }
    }

    const getNotifiableStudents = async (teacherEmail, mentionedStudents) => {
        try {
            return await userStore.getNotifiableStudentsByTeacherEmailAndMentions(teacherEmail, mentionedStudents);
        } catch (err) {
            console.error('Error in getNotifiableStudents:', err);
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