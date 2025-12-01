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
        
        validateRegisterRequest(req);
        await userBus.registerTeacherStudentMap(teacher, students);
        res.status(204).json();
    });

    router.get('/api/commonstudents', async (req, res) => {
        const teacherEmails = [].concat(req.query.teacher);

        validateCommonStudentsRequest(req);
        const commonStudents = await userBus.getCommonStudentsFromTeachers(teacherEmails);
        res.status(200).json({ students: commonStudents });
    });

    router.post('/api/suspend', async (req, res) => {
        const { student } = req.body;

        validateSuspendRequest(req);
        await userBus.suspendStudent(student);
        res.status(204).json();
    })

    router.post('/api/retrievefornotifications', async (req, res) => {
        const { teacher, notification } = req.body;

        validateNotifiableRequest(req);

        // Extract mentioned students from notification
        const mentionedStudents = extractMentionedStudents(notification);

        const notifiableStudents = await userBus.getNotifiableStudents(teacher, mentionedStudents);
        res.status(200).json({ recipients: notifiableStudents });
    });
}

module.exports = userApp;