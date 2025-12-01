const {
    INSERT_TEACHER,
    INSERT_STUDENT,
    INSERT_STUDENTS_BULK,
    INSERT_TEACHER_STUDENT_MAP,
    INSERT_TEACHER_STUDENT_MAP_BULK,
    GET_STUDENT_ID_BY_EMAIL,
    GET_COMMON_STUDENTS_BY_TEACHER_EMAILS,
    SUSPEND_STUDENT_BY_EMAIL,
    GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL,
    GET_TEACHERS_ID_BY_EMAILS,
} = require('./queries');

const { DuplicateEntryError, InvalidCredentialsError } = require('./errors');

const userStore = (dbConnection) => {
    const db = dbConnection;

    const handleDbError = (err) => {
        if (err.code === 'ER_DUP_ENTRY') {
            throw new DuplicateEntryError();
        }
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            throw new InvalidCredentialsError();
        }
        throw err;
    };

    // Adds a new teacher to the database
    // Throws DuplicateEntryError if the teacher already exists
    const registerTeacher = async (email) => {
        try {
            await db.query(INSERT_TEACHER, [email]);
        } catch (err) {
            handleDbError(err);
        }
    }

    // Adds a new student to the database
    // Throws DuplicateEntryError if the student already exists
    const registerStudent = async (email) => {
        try {
            await db.query(INSERT_STUDENT, [email]);
        } catch (err) {
            handleDbError(err);
        }
    }

    // Assigns a student to a teacher
    // Throws DuplicateEntryError if the assignment already exists
    const assignStudentToTeacher = async (teacherEmail, studentEmail) => {
        try {
            await db.query(INSERT_TEACHER_STUDENT_MAP, [teacherEmail, studentEmail]);
        } catch (err) {
            handleDbError(err);
        }
    }

    const registerStudentsBulk = async (emails) => {
        const values = emails.map(email => [email]);
        try {
            await db.query(INSERT_STUDENTS_BULK, [values]);
        } catch (err) {
            handleDbError(err);
        }
    }

    const assignStudentsToTeacherBulk = async (teacherEmail, studentEmails) => {
        const values = studentEmails.map(studentEmail => [teacherEmail, studentEmail]);
        try {
            await db.query(INSERT_TEACHER_STUDENT_MAP_BULK, [values]);
        } catch (err) {
            handleDbError(err);
        }
    }


    // Get the ID of a teacher by email
    // Returns null if the teacher does not exist
    const getStudentIdByEmail = async (email) => {
        try {
            const [rows] = await db.query(GET_STUDENT_ID_BY_EMAIL, [email]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0].id;
        } catch (err) {
            handleDbError(err);
        }    
    }

    // Get list of students common to given teachers
    const getCommonStudentsByTeacherEmails = async (teacherEmails) => {
        try {
            const [rows] = await db.query(GET_COMMON_STUDENTS_BY_TEACHER_EMAILS, [teacherEmails, teacherEmails.length]);
            return rows.map(row => row.student_email);    
        } catch (err) {
            handleDbError(err);
        }
    }

    // Suspend student by email
    const suspendStudentByEmail = async (email) => {
        try {
            await db.query(SUSPEND_STUDENT_BY_EMAIL, [email]);
        } catch (err) {
            handleDbError(err);
        }
    }

    // Get notifiable students by teacher email and mentioned
    const getNotifiableStudentsByTeacherEmailAndMentions = async (teacherEmail, mentionedStudents) => { 
        try {
            const studentsToQuery = (mentionedStudents && mentionedStudents.length > 0) ? mentionedStudents : [null];
            const [rows] = await db.query(GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL, [teacherEmail, studentsToQuery]);
            return rows.map(row => row.student_email);
        } catch (err) {
            handleDbError(err);
        }
    }

    // Get teacher ID by emails
    const getTeachersByEmails = async (emails) => {
        try {
            const [rows] = await db.query(GET_TEACHERS_ID_BY_EMAILS, [emails]);
            return rows;
        } catch (err) {
            handleDbError(err);
        }
    }

    return {
        registerTeacher,
        registerStudent,
        registerStudentsBulk,
        assignStudentToTeacher,
        assignStudentsToTeacherBulk,
        getStudentIdByEmail,
        getCommonStudentsByTeacherEmails,
        suspendStudentByEmail,
        getNotifiableStudentsByTeacherEmailAndMentions,
        getTeachersByEmails,
    }
}

module.exports = { userStore };