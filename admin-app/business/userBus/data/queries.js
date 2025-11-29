const INSERT_TEACHER_AND_RETURN_ID = 'INSERT INTO teachers (email) VALUES ($1) RETURNING id';
const INSERT_STUDENT_AND_RETURN_ID = 'INSERT INTO students (email) VALUES ($1) RETURNING id';
const INSERT_TEACHER_STUDENT_MAP = 'INSERT INTO teacher_student_map (teacher_id, student_id) VALUES ($1, $2)';

const GET_TEACHER_ID_BY_EMAIL = 'SELECT id FROM teachers WHERE email = $1 and is_deleted = false';
const GET_STUDENT_ID_BY_EMAIL = 'SELECT id FROM students WHERE email = $1 AND is_deleted = false';
const GET_COMMON_STUDENTS_BY_TEACHER_ID = `
    SELECT student_id
    FROM teacher_student_map
    WHERE teacher_id = ANY($1) and is_deleted = false
    GROUP BY student_id
    HAVING COUNT(DISTINCT teacher_id) = array_length($1, 1);
`

module.exports = {
    INSERT_TEACHER_AND_RETURN_ID,
    INSERT_STUDENT_AND_RETURN_ID,
    INSERT_TEACHER_STUDENT_MAP,
    GET_TEACHER_ID_BY_EMAIL,
    GET_STUDENT_ID_BY_EMAIL,
    GET_COMMON_STUDENTS_BY_TEACHER_ID,
};
