create table if not exists teacher_student_map (
    teacher_id UUID not null references teachers(id),
    student_id UUID references students(id),
    is_deleted boolean default false,
    primary key (teacher_id, student_id, is_deleted)
);
create index if not exists idx_teacher_student_map on teacher_student_map(teacher_id, student_id, is_deleted);