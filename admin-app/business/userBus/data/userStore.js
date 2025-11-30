const {
    INSERT_TEACHER,
    INSERT_STUDENT,
    INSERT_TEACHER_STUDENT_MAP,
    GET_TEACHER_ID_BY_EMAIL,
    GET_STUDENT_ID_BY_EMAIL,
    GET_COMMON_STUDENTS_BY_TEACHER_EMAILS,
    SUSPEND_STUDENT_BY_EMAIL,
    GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL,
    GET_TEACHERS_ID_BY_EMAILS,
} = require('./queries');

const { DuplicateEntryError } = require('./errors');

const userStore = (dbConnection) => {
    const db = dbConnection;

    // Adds a new teacher to the database
    // Throws DuplicateEntryError if the teacher already exists
    const registerTeacher = async (email) => {
        try {
            await db.query(INSERT_TEACHER, [email], (err, resp) => {
                if (err) {
                    throw err;
                }
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new DuplicateEntryError();
            }
            throw err;
        }
    }

    // Adds a new student to the database
    // Throws DuplicateEntryError if the student already exists
    const registerStudent = async (email) => {
        try {
            await db.query(INSERT_STUDENT, [email], (err, resp) => {
                if (err) {
                    throw err;
                }
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new DuplicateEntryError();
            }
            throw err;
        }
    }

    // Assigns a student to a teacher
    // Throws DuplicateEntryError if the assignment already exists
    const assignStudentToTeacher = async (teacherEmail, studentEmail) => {
        try {
            await db.query(INSERT_TEACHER_STUDENT_MAP, [teacherEmail, studentEmail], (err, resp) => {
                if (err) {
                    throw err;
                }
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new DuplicateEntryError();
            }
            throw err;
        }
    }

    // Get the ID of a teacher by email
    // Returns null if the teacher does not exist
    const getTeacherIdByEmail = async (email) => {
        const [rows] = await db.query(GET_TEACHER_ID_BY_EMAIL, [email]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0].id;
    }

    // Get the ID of a teacher by email
    // Returns null if the teacher does not exist
    const getStudentIdByEmail = async (email) => {
        const [rows] = await db.query(GET_STUDENT_ID_BY_EMAIL, [email]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0].id;
    }

    // Get list of students common to given teachers
    const getCommonStudentsByTeacherIds = async (teacherIds) => {
        try {
            const [rows] = await db.query(GET_COMMON_STUDENTS_BY_TEACHER_EMAILS, [teacherIds, teacherIds.length]);
            console.log('Common students rows:', rows);
            return rows.map(row => row.student_email);    
        } catch (err) {
            console.error('Error when getting common students:', err);
            throw err;
        }
    }

    // Suspend student by email
    const suspendStudentByEmail = async (email) => {
        try {
            await db.query(SUSPEND_STUDENT_BY_EMAIL, [email]);
        } catch (err) {
            console.error('Error when suspending student:', err);
            throw err;
        }
    }

    // Get notifiable students by teacher email and mentioned
    const getNotifiableStudentsByTeacherEmailAndMentions = async (teacherEmail, mentionedStudents) => { 
        try {
            const studentsToQuery = (mentionedStudents && mentionedStudents.length > 0) ? mentionedStudents : [null];
            const [rows] = await db.query(GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL, [teacherEmail, studentsToQuery]);
            return rows.map(row => row.student_email);
        } catch (err) {
            console.error('Error when getting notifiable students:', err);
            throw err;
        }
    }

    // Get teacher ID by emails
    const getTeacherIdsByEmails = async (emails) => {
        const [rows] = await db.query(GET_TEACHERS_ID_BY_EMAILS, [emails]);
        return rows;
    }

    return {
        registerTeacher,
        registerStudent,
        getTeacherIdByEmail,
        getStudentIdByEmail,
        assignStudentToTeacher,
        getCommonStudentsByTeacherIds,
        suspendStudentByEmail,
        getNotifiableStudentsByTeacherEmailAndMentions,
        getTeacherIdsByEmails,
    }
}

module.exports = { userStore };