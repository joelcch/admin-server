const { DuplicateUserError } = require("../../business/userBus/errors");

const userApp = (router, userBus) => {
    router.post('/api/register', async (req, res) => {
        const { teacher } = req.body;
        try {
            await userBus.registerTeacher(teacher);
            res.status(201);
        } catch (error) {
            if (error instanceof DuplicateUserError) {
                res.status(409).json({ error: 'User already exists' });
                return;
            }
            res.status(500).json({ error: 'Registration failed' });
        }
    });
}

module.exports = userApp;
