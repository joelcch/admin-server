const mysql = require('mysql2/promise');
const express = require('express');
const { initializeApp } = require('./app');
const errorHandler = require('./app/userApp/errorHandler');


// configurations for creating mysql connection
const connection = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    port: 3306
});

initializeApp(connection).then((appRouter) => {
    const app = express();
    app.use(express.json());
    app.use('/', appRouter);
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});