const mockery = require('mockery');
const { UserDoesNotExistError, AuthenticationError } = require('./errors');
const { DuplicateEntryError, InvalidCredentialsError } = require('./data/errors');

describe('userBus', () => {
  let mockStore;
  let bus;
  let userBus;

  beforeAll(() => {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    mockery.registerAllowable('./userBus');
    mockery.registerAllowable('./errors');
    mockery.registerAllowable('./data/errors');
    
    userBus = require('./userBus');

    mockStore = {
      registerTeacher: jest.fn(),
      registerStudent: jest.fn(),
      getTeacherIdByEmail: jest.fn(),
      assignStudentToTeacher: jest.fn(),
      getTeachersByEmails: jest.fn(),
      getCommonStudentsByTeacherEmails: jest.fn(),
      getStudentIdByEmail: jest.fn(),
      suspendStudentByEmail: jest.fn(),
      getNotifiableStudentsByTeacherEmailAndMentions: jest.fn(),
    };
    bus = userBus(mockStore);
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  const genericError = new Error('Generic error');

  describe('registerTeacherStudentMap', () => {
    const teacherEmail = 'teacher@example.com';
    const studentEmail1 = 'student1@example.com'
    const studentEmail2 = 'student2@example.com'
    const studentEmails = [studentEmail1, studentEmail2];

    const scenarios = [
      {
        desc: 'when new teacher and students should register all and assign and return no error',
        setup: () => {},
        assertions: () => {
          expect(mockStore.registerTeacher).toHaveBeenCalledWith(teacherEmail);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail1);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail2);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail1);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail2);
        }
      },
      {
        desc: 'when teacher exists should ignore DuplicateEntryError and register students and assign',
        setup: () => mockStore.registerTeacher.mockRejectedValue(new DuplicateEntryError()),
        assertions: () => {
          expect(mockStore.registerTeacher).toHaveBeenCalledWith(teacherEmail);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail1);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail2);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail1);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail2);
        }
      },
      {
        desc: 'when student exists should ignore DuplicateEntryError for that student and assign',
        setup: () => mockStore.registerStudent.mockRejectedValue(new DuplicateEntryError()),
        assertions: () => {
          expect(mockStore.registerTeacher).toHaveBeenCalledWith(teacherEmail);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail1);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail2);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail1);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail2);
        }
      },
      {
        desc: 'when student-teacher assignment exists should ignore DuplicateEntryError',
        setup: () => mockStore.assignStudentToTeacher.mockRejectedValue(new DuplicateEntryError()),
        assertions: () => {
          expect(mockStore.registerTeacher).toHaveBeenCalledWith(teacherEmail);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail1);
          expect(mockStore.registerStudent).toHaveBeenCalledWith(studentEmail2);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail1);
          expect(mockStore.assignStudentToTeacher).toHaveBeenCalledWith(teacherEmail, studentEmail2);
        }
      },
      {
        desc: 'should rethrow other errors from teacher registration',
        setup: () => mockStore.registerTeacher.mockRejectedValue(genericError),
        expectedError: genericError
      },
      {
        desc: 'should rethrow other errors from student registration',
        setup: () => mockStore.registerStudent.mockRejectedValue(genericError),
        expectedError: genericError
      }
    ];

    scenarios.forEach(({ desc, setup, assertions, expectedError }) => {
      it(desc, async () => {
        setup();
        if (expectedError) {
            await expect(bus.registerTeacherStudentMap(teacherEmail, studentEmails)).rejects.toThrow(expectedError);
        } else {
            await bus.registerTeacherStudentMap(teacherEmail, studentEmails);
            if (assertions) assertions();
        }
      });
    });
  });

  describe('getCommonStudentsFromTeachers', () => {
    const teacherEmails = ['t1@example.com', 't2@example.com'];
    const mockStudents = ['common@example.com'];

    const scenarios = [
      {
        desc: 'when getting common students succeeds should return student list',
        setup: () => {
          mockStore.getTeachersByEmails.mockResolvedValue([
             { email: 't1@example.com', id: 1 },
             { email: 't2@example.com', id: 2 }
          ]);
          mockStore.getCommonStudentsByTeacherEmails.mockResolvedValue(mockStudents);
        },
        expectedResult: mockStudents,
        assertions: () => {
            expect(mockStore.getTeachersByEmails).toHaveBeenCalledWith(teacherEmails);
            expect(mockStore.getCommonStudentsByTeacherEmails).toHaveBeenCalledWith(teacherEmails);
        }
      },
      {
        desc: 'when teacher does not exist should throw UserDoesNotExistError',
        setup: () => {
           mockStore.getTeachersByEmails.mockResolvedValue([
             { email: 't1@example.com', id: 1 }
           ]);
        },
        expectedError: UserDoesNotExistError
      },
      {
        desc: 'when userStore throws InvalidCredentialsError should throw AuthenticationError',
        setup: () => mockStore.getTeachersByEmails.mockRejectedValue(new InvalidCredentialsError()),
        expectedError: AuthenticationError
      }
    ];

    scenarios.forEach(({ desc, setup, expectedResult, expectedError, assertions }) => {
      it(desc, async () => {
        setup();
        if (expectedError) {
            await expect(bus.getCommonStudentsFromTeachers(teacherEmails)).rejects.toThrow(expectedError);
        } else {
            const result = await bus.getCommonStudentsFromTeachers(teacherEmails);
            expect(result).toEqual(expectedResult);
            if (assertions) assertions();
        }
      });
    });
  });

  describe('suspendStudent', () => {
    const email = 'student@example.com';
    const scenarios = [
      {
        desc: 'when student exists should suspend student without error',
        setup: () => mockStore.getStudentIdByEmail.mockResolvedValue(100),
        assertions: () => expect(mockStore.suspendStudentByEmail).toHaveBeenCalledWith(email)
      },
      {
        desc: 'when student does not exist should throw UserDoesNotExistError',
        setup: () => mockStore.getStudentIdByEmail.mockResolvedValue(null),
        expectedError: UserDoesNotExistError
      },
      {
        desc: 'when userStore throws InvalidCredentialsError should throw AuthenticationError',
        setup: () => {
          mockStore.getStudentIdByEmail.mockResolvedValue(100);
          mockStore.suspendStudentByEmail.mockRejectedValue(new InvalidCredentialsError());
        },
        expectedError: AuthenticationError
      }
    ];

    scenarios.forEach(({ desc, setup, expectedError, assertions }) => {
      it(desc, async () => {
        setup();
        if (expectedError) {
            await expect(bus.suspendStudent(email)).rejects.toThrow(expectedError);
        } else {
            await bus.suspendStudent(email);
            if (assertions) assertions();
        }
      });
    });
  });

  describe('getNotifiableStudents', () => {
    const teacherEmail = 't1@example.com';
    const mentions = ['s1@example.com'];
    const expectedStudents = ['s1@example.com', 's2@example.com'];

    const scenarios = [
        {
            desc: 'when valid teacher should return notifiable students',
            setup: () => mockStore.getNotifiableStudentsByTeacherEmailAndMentions.mockResolvedValue(expectedStudents),
            expectedResult: expectedStudents
        },
        {
            desc: 'should throw AuthenticationError on InvalidCredentialsError',
            setup: () => mockStore.getNotifiableStudentsByTeacherEmailAndMentions.mockRejectedValue(new InvalidCredentialsError()),
            expectedError: AuthenticationError
        }
    ];

    scenarios.forEach(({ desc, setup, expectedResult, expectedError }) => {
        it(desc, async () => {
            setup();
            if (expectedError) {
                await expect(bus.getNotifiableStudents(teacherEmail, mentions)).rejects.toThrow(expectedError);
            } else {
                const result = await bus.getNotifiableStudents(teacherEmail, mentions);
                expect(result).toEqual(expectedResult);
            }
        });
    });
  });
});