const { DuplicateUserError, UserDoesNotExistError } = require("../../business/userBus/errors");

const userApp = (router, userBus) => {
    router.post('/api/register', async (req, res) => {
        const { teacher, students } = req.body;
        try {
            await userBus.registerTeacherStudentMap(teacher, students);
            res.status(204).json();
        } catch (error) {
            console.error('Error in /api/register:', error);
            res.status(500).json({ error: 'teacher registration failed' });
        }
    });

    router.get('/api/commonstudents', async (req, res) => {
        const teacherEmails = req.query.teacher;
        try {
            // Format the emails
            let formattedTeacherEmails = [];
            for (const email of teacherEmails) {
                formattedTeacherEmails.push(email.replace('%40', '@'));
            }
            const commonStudents = await userBus.getCommonStudentsFromTeachers(formattedTeacherEmails);
            res.status(200).json({ students: commonStudents });
        } catch (error) {
            if (error instanceof UserDoesNotExistError) {
                res.status(404).json({ error: 'one or more teachers do not exist', emails: error.emails });
                return;
            }
            console.error('Error: ', error);
            res.status(500).json({ error: 'failed to retrieve common students' });
        }
    });

    router.post('/api/register/teacher', async (req, res) => {
        const { teacher } = req.body;
        try {
            await userBus.registerTeacher(teacher);
            res.status(201).json();
        } catch (error) {
            if (error instanceof DuplicateUserError) {
                res.status(409).json({ error: 'teacher already exists' });
                return;
            }
            res.status(500).json({ error: 'teacher registration failed' });
        }
    });

    router.post('/api/suspend', async (req, res) => {
        const { student } = req.body;
        try {
            await userBus.suspendStudent(student);
            res.status(204).json();
        } catch (error) {
            if (error instanceof UserDoesNotExistError) {
                res.status(404).json({ error: 'student does not exist' });
                return;
            }
            res.status(500).json({ error: 'student registration failed' });
        }   
    })

    router.post('/api/retrievefornotifications', async (req, res) => {
        const { teacher, notification } = req.body;
        try {
            // Extract mentioned students from notification
            const mentionedStudents = extractMentionedStudents(notification);

            const notifiableStudents = await userBus.getNotifiableStudents(teacher, mentionedStudents);
            res.status(200).json({ recipients: notifiableStudents });
        } catch (error) {
            console.error('Error in /api/retrievefornotifications:', error);
            res.status(500).json({ error: 'failed to retrieve notifiable students' });
        }
    });



    // Testing endpoints 
    router.post('/api/register/student', async (req, res) => {
        const { student } = req.body;
        try {
            await userBus.registerTeacher(student);
            res.status(201).json();
        } catch (error) {
            if (error instanceof DuplicateUserError) {
                res.status(409).json({ error: 'student already exists' });
                return;
            }
            res.status(500).json({ error: 'student registration failed' });
        }
    });

    router.get('/api/teacher/:email', async (req, res) => {
        const email = req.params.email;
        try {
            const teacherId = await userBus.getTeacherIdByEmail(email);
            console.log('Retrieved student ID:', teacherId);
            if (teacherId) {
                res.status(200).json({ id: teacherId });
            } else {
                res.status(404).json({ error: 'teacher not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'failed to retrieve teacher' });
        }
    });

    function extractMentionedStudents(notification) {
        const words = notification.split(' ');
        const mentionedStudents = words
            .filter(word => word.startsWith('@'))
            .map(word => word.substring(1)); // Remove '@' character
        return mentionedStudents ? mentionedStudents : [];
    }
}

module.exports = userApp;
