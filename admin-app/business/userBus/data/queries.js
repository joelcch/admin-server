const INSERT_TEACHER = 'INSERT INTO teachers (email) VALUES (?)';
const INSERT_STUDENT = 'INSERT INTO students (email) VALUES (?)';
const INSERT_STUDENTS_BULK = 'INSERT IGNORE INTO students (email) VALUES ?';
const INSERT_TEACHER_STUDENT_MAP = 'INSERT INTO teacher_student_map (teacher_email, student_email) VALUES (?, ?)';
const INSERT_TEACHER_STUDENT_MAP_BULK = 'INSERT IGNORE INTO teacher_student_map (teacher_email, student_email) VALUES ?';

// const GET_TEACHER_ID_BY_EMAIL = 'SELECT id FROM teachers WHERE email = ? and is_deleted = false';
const GET_STUDENT_ID_BY_EMAIL = 'SELECT id FROM students WHERE email = ? AND is_deleted = false';
const GET_COMMON_STUDENTS_BY_TEACHER_EMAILS = `
    SELECT student_email
    FROM teacher_student_map
    WHERE teacher_email IN (?)
        AND is_deleted = FALSE
    GROUP BY student_email
    HAVING COUNT(DISTINCT teacher_email) = ?;
`
const GET_TEACHERS_ID_BY_EMAILS = `
    SELECT id, email
    FROM teachers
    WHERE email IN (?);
`

const SUSPEND_STUDENT_BY_EMAIL = `
    UPDATE students
    SET is_suspended = TRUE
    WHERE email = ?;
`

const GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL = `
    SELECT DISTINCT(tsm.student_email)
    FROM teacher_student_map tsm
    JOIN (
        SELECT s.email
        FROM students s
        WHERE is_deleted = false AND is_suspended = false
    ) AS s 
    ON tsm.student_email = s.email
    WHERE tsm.is_deleted = false AND (tsm.teacher_email = ? OR tsm.student_email IN (?));
`

module.exports = {
    INSERT_TEACHER,
    INSERT_STUDENT,
    INSERT_STUDENTS_BULK,
    INSERT_TEACHER_STUDENT_MAP,
    INSERT_TEACHER_STUDENT_MAP_BULK,
    GET_STUDENT_ID_BY_EMAIL,
    GET_TEACHERS_ID_BY_EMAILS,
    GET_COMMON_STUDENTS_BY_TEACHER_EMAILS,
    SUSPEND_STUDENT_BY_EMAIL,
    GET_NOTIFIABLE_STUDENTS_BY_TEACHER_EMAIL
};
