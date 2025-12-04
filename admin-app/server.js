
const mysql = require('mysql2/promise');
const express = require('express');
const { initializeApp } = require('./app');
const errorHandler = require('./app/userApp/errorHandler');

async function startServer() {
    try {
        var dbConfig = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        };

        // Check if socketPath or host/port should be used
        if (process.env.DB_HOST && process.env.DB_HOST.startsWith('/')) {
            dbConfig.socketPath = process.env.DB_HOST;
        } else {
            dbConfig.host = process.env.DB_HOST;
            if (process.env.DB_PORT) {
                dbConfig.port = Number(process.env.DB_PORT);
            }
        }

        // configurations for creating mysql connection
        const connection = mysql.createPool(dbConfig);

        // Initialize app
        const appRouter = await initializeApp(connection);

        const app = express();
        app.use(express.json());
        app.use('/', appRouter);
        app.use(errorHandler);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
