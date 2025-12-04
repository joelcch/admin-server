# Admin Server

This project is a administrative server for operations related to teachers and students, as well as a containerized database for hosting locally.

## Project Structure

- **admin-app/**: Admin application APIs for user operations.
- **db/**: Database configuration and migration/schema scripts.
- **docker-compose.yaml**: Used for launching of admin application and database containers.
- **makefile**: Convenience commands for building, running, and testing.

## Prerequisites

- Docker
- Docker Compose
- Make

## Configuration

Before running the application, you must configure the environment variables.

### 1. Database Configuration

Create a `.env` file in the `db/` directory based on `db/.example.env`.

```bash
cp db/.example.env db/.env
```

Edit `db/.env` and set your desired credentials:

```ini
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=users
MYSQL_USER=admin # To be configured, not in .example.env
MYSQL_PASSWORD=mypassword # To be configured, not in .example.env
```

### 2. Application Configuration

Create a `.env` file in the `admin-app/foundation/env/` directory based on `admin-app/foundation/env/.example.env`.

```bash
cp admin-app/foundation/env/.example.env admin-app/foundation/env/.env
```

Edit `admin-app/foundation/env/.env`. **Ensure the database credentials match what you set in `db/.env`**.

```ini
# App Port
PORT=3000

# Database Connection
DB_PORT=3306
DB_HOST=host.docker.internal
DB_USER=admin # To be configured, not in .example.env
DB_PASSWORD=mypassword # To be configured, not in .example.env
DB_NAME=users
```

> **Note:** The `DB_HOST` is set to `host.docker.internal` to allow the container to communicate with the host or other containers via the gateway, which is configured in `docker-compose.yaml`.

## Build and Run

You can use the provided `makefile` for common tasks. To run the application follow these steps:

### 1. Build the Containers
This command will build the 2 docker images to be launched using docker compose.
```bash
make build
```

### 2. Start the Application
This command runs the docker compose command to launch the admin app and database containers. 

*Note: Ensure that port :3306 is available and no other MySQL databases are running on that port*  
```bash
make start
```

The application will be available at `http://localhost:3000` (or the port configured in your `.env`).
The database will be exposed on port `3306`.

### Stop the Application

```bash
make stop
```

### Run Tests

To run the tests for the `admin-app`:

```bash
make test
```

## API Reference

To access the API endpoints, prepend the base URL depending on your environment:

- **Local Development:** `http://localhost:3000`
- **Cloud Hosted:** `https://admin-app-43429001698.asia-southeast1.run.app`

### 1. Register Students
Register a teacher and students, and link them.

- **URL:** `/api/register`
- **Method:** `POST`
- **Body:**
    ```json
    {
      "teacher": "teacherken@gmail.com",
      "students": [
        "studentjon@gmail.com",
        "studenthon@gmail.com"
      ]
    }
    ```
- **Success Response:** `204 No Content`
- **Error Responses:**
    - `400 Bad Request`: Invalid email format (teacher or student) or request body missing required fields.
        ```json
        { "error": "Invalid email: invalid@email" }
        ```
        ```json
        { "error": "teacher email required" }
        ```

### 2. Get Common Students
Retrieve a list of students common to a given list of teachers.

- **URL:** `/api/commonstudents`
- **Method:** `GET`
- **Query Params:** `teacher` (repeatable)
    - Example: `/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com`
- **Success Response:** `200 OK`
    ```json
    {
      "students": [
        "commonstudent1@gmail.com",
        "commonstudent2@gmail.com"
      ]
    }
    ```
- **Error Responses:**
    - `400 Bad Request`: Missing teacher email query param or invalid email format.
        ```json
        {
            "error": "at least one teacher email is required"
        }
        ```
        ```json
        {
            "error": "Invalid emails: sensegmail.com"
        }
        ```
    - `404 Not Found`: One or more teachers do not exist.
        ```json
        {
            "error": "1 or more teachers do not exist.",
            "emails": ["nonexistent@gmail.com"]
        }
        ```

### 3. Suspend Student
Suspend a specified student.

- **URL:** `/api/suspend`
- **Method:** `POST`
- **Body:**
    ```json
    {
      "student": "studentmary@gmail.com"
    }
    ```
- **Success Response:** `204 No Content`
- **Error Responses:**
    - `400 Bad Request`: Invalid email format or missing student field.
        ```json
        {
            "error": "Invalid email: studentgmail.com"
        }
        ```
        ```json
        {
            "error": "student email required"
        }
        ```
    - `404 Not Found`: Student does not exist.
        ```json
        { "error": "student does not exist" }
        ```

### 4. Retrieve for Notifications
Retrieve a list of students who can receive a given notification.

- **URL:** `/api/retrievefornotifications`
- **Method:** `POST`
- **Body:**
    ```json
    {
      "teacher":  "teacherken@gmail.com",
      "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
    }
    ```
- **Success Response:** `200 OK`
    ```json
    {
      "recipients": [
        "studentbob@gmail.com",
        "studentagnes@gmail.com", 
        "studentmiche@gmail.com"
      ]
    }
    ```
- **Error Responses:**
    - `400 Bad Request`: Invalid email format or missing required fields.
        ```json
        {
            "error": "Invalid email: teacherkengmail.com"
        }
        ```
    - `404 Not Found`: Teacher does not exist.
        ```json
        { "error": "teacher does not exist" }
        ```

## Database Migrations

Database initialization scripts are located in `db/migration/`. These scripts run automatically when the database container is created for the first time.

- `0001_create_teachers.sql`
- `0002_create_students.sql`
- `0003_create_teacher_student_map.sql`

## Data Persistence

Database data is persisted in the `db/data/` directory on your local machine due to the volume mapping in `docker-compose.yaml`. This is for continuous testing in the event the database is stopped and restarted.
