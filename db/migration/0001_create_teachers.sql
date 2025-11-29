create table if not exists teachers (
    id UUID primary key default UUID(),
    email varchar(150) not null unique,
    is_deleted boolean default false,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);
create index if not exists idx_teachers_email on teachers(id, email, is_deleted);