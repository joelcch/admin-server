CREATE TABLE IF NOT EXISTS teacher_student_map (,
    teacher_email VARCHAR(150) NOT NULL,
    student_email VARCHAR(150) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (teacher_email, student_email),
    INDEX idx_student_email (student_email),
    INDEX idx_teacher_email_deleted (teacher_email, is_deleted),
    CONSTRAINT fk_teacher FOREIGN KEY (teacher_email) REFERENCES teachers(email),
    CONSTRAINT fk_student FOREIGN KEY (student_email) REFERENCES students(email)
);
