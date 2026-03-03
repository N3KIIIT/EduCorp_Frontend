export const SESSION_CONSTANTS = {
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'auth_access_token',
        REFRESH_TOKEN: 'auth_refresh_token',
        TOKEN_EXPIRES_AT: 'auth_token_expires_at',
        USER_DATA: 'auth_user_data',
    },

    REFRESH_THRESHOLD_SECONDS: 300,
    REFRESH_RETRY_ATTEMPTS: 3,
    REFRESH_RETRY_DELAY_MS: 1000,

    SESSION_TIMEOUT_MS: 30 * 60 * 1000,
    SESSION_CHECK_INTERVAL_MS: 60 * 1000,
} as const;

export const PERMISSIONS = {
    USERS_READ: 'Users.Read',
    USERS_WRITE: 'Users.Write',
    USERS_DELETE: 'Users.Delete',
    USERS_MANAGE: 'Users.Manage',

    COURSES_READ: 'Courses.Read',
    COURSES_WRITE: 'Courses.Write',
    COURSES_DELETE: 'Courses.Delete',
    COURSES_MANAGE: 'Courses.Manage',

    LESSONS_READ: 'Lessons.Read',
    LESSONS_WRITE: 'Lessons.Write',
    LESSONS_DELETE: 'Lessons.Delete',

    CONTENT_BLOCKS_READ: 'ContentBlocks.Read',
    CONTENT_BLOCKS_WRITE: 'ContentBlocks.Write',
    CONTENT_BLOCKS_DELETE: 'ContentBlocks.Delete',

    TESTS_READ: 'Tests.Read',
    TESTS_WRITE: 'Tests.Write',
    TESTS_DELETE: 'Tests.Delete',

    QUESTIONS_READ: 'Questions.Read',
    QUESTIONS_WRITE: 'Questions.Write',
    QUESTIONS_DELETE: 'Questions.Delete',

} as const;

export const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    USER: 'User',
    VIEWER: 'Viewer',
} as const;
