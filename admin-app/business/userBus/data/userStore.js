const { INSERT_USER_AND_RETURN_ID, GET_USER_BY_USERNAME, GET_USER_BY_CREDENTIALS } = require('./queries');
const { DuplicateUserError } = require('../errors');
const { INSERT_TEACHER_AND_RETURN_ID } = require('./queries');
const mysql = require('mysql2');

async function connectToDatabase(config) {
    try {
        var connection = mysql.createConnection(config);
        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err.stack);
                return;
            }
            console.log('Connected to MySQL as id ' + connection.threadId);
        });
        return connection;
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

const userStore = (dbConnection) => {
    const db = dbConnection;

    const registerTeacher = async (email) => {
        try {
            const res = await db.query(
                INSERT_TEACHER_AND_RETURN_ID,           
                [email]
            );
            return res.rows[0].id;
        } catch (err) {
            if (err.code === '23505') { // Unique violation
                throw new DuplicateUserError();
            }
            console.error('Error registering teacher:', err);
            throw err;
        }
    }

    return {
        registerTeacher
    }
}

module.exports = { connectToDatabase, userStore };