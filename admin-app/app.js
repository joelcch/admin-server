const express = require('express');
const router = express.Router();

const { userStore } = require('./business/userBus/data/userStore');
const userBus = require('./business/userBus/userBus');

async function initializeApp(dbConnection) {

    const store = userStore(dbConnection);
    const bus = userBus(store);

    require('./app/userApp/userApp')(router, bus);

    return router;
}

module.exports = { initializeApp };