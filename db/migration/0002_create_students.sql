create table if not exists students (
    id UUID primary key default UUID(),
    email varchar(150) not null unique,
    is_deleted boolean default false,
    is_suspended boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);
create index if not exists idx_students_email on students(id, email, is_deleted);