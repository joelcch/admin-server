const { UserDoesNotExistError } = require("../../business/userBus/errors");
const { extractMentionedStudents } = require('./utils');

const {
    validateRegisterRequest,
    validateCommonStudentsRequest,
    validateSuspendRequest,
    validateNotifiableRequest,
} = require('./validation');

const userApp = (router, userBus) => {
    router.post('/api/register', async (req, res) => {
        const { teacher, students } = req.body;
        
        try {
            validateRegisterRequest(req);
        } catch (error) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        try {
            await userBus.registerTeacherStudentMap(teacher, students);
            res.status(204).json();
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'teacher registration failed' });
        }
    });

    router.get('/api/commonstudents', async (req, res) => {
        const teacherEmails = [].concat(req.query.teacher);

        try {
            validateCommonStudentsRequest(req);
        } catch (error) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        try {
            const commonStudents = await userBus.getCommonStudentsFromTeachers(teacherEmails);
            res.status(200).json({ students: commonStudents });
        } catch (error) {
            if (error instanceof UserDoesNotExistError) {
                res.status(404).json({ error: 'one or more teachers do not exist', emails: error.emails });
                return;
            }
            console.log(error);
            res.status(500).json({ error: 'failed to retrieve common students' });
        }
    });

    router.post('/api/suspend', async (req, res) => {
        const { student } = req.body;

        try {
            validateSuspendRequest(req);
        } catch (error) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        try {
            await userBus.suspendStudent(student);
            res.status(204).json();
        } catch (error) {
            if (error instanceof UserDoesNotExistError) {
                res.status(404).json({ error: 'student does not exist' });
                return;
            }
            console.log(error);
            res.status(500).json({ error: 'student registration failed' });
        }   
    })

    router.post('/api/retrievefornotifications', async (req, res) => {
        const { teacher, notification } = req.body;

        try {
            validateNotifiableRequest(req);
        } catch (error) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        try {
            // Extract mentioned students from notification
            const mentionedStudents = extractMentionedStudents(notification);

            const notifiableStudents = await userBus.getNotifiableStudents(teacher, mentionedStudents);
            res.status(200).json({ recipients: notifiableStudents });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'failed to retrieve notifiable students' });
        }
    });
}

module.exports = userApp;
