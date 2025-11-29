const express = require('express');
const router = express.Router();

const { connectToDatabase, userStore } = require('./business/userBus/data/userStore');
const userBus = require('./business/userBus/userBus');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST, // You can use 'localhost\\SQLEXPRESS' for local instances
    database: process.env.DB_NAME,
    port: 3306
};

async function initializeApp() {
    const dbConnection = await connectToDatabase(config);

    const store = userStore(dbConnection);
    const bus = userBus(store);

    require('./app/userApp/userApp')(router, bus);

    return router;
}

initializeApp().then((appRouter) => {
    const app = express();
    app.use(express.json());
    app.use('/', appRouter);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});