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

} as const;

export const ROLES = {
    SUPER_ADMIN: 'SuperAdmin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    USER: 'User',
    VIEWER: 'Viewer',
} as const;
