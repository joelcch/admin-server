const { DuplicateUserError } = require('./errors');

const userBus = (store) => {
    const userStore = store;

    const registerTeacher = async (email) => {
        const teacherId = await userStore.registerTeacher(email);
        if (teacherId) {
            throw new DuplicateUserError('teacher already exists');
        }
        return teacherId;
    }

    return {
        registerTeacher
    }
}

module.exports = userBus;