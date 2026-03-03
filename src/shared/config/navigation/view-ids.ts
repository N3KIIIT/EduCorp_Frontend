
export const VIEW_IDS = {
    HOME: 'home',
    SEARCH: 'search',
    PROFILE: 'profile',
    ADMIN: 'admin'
} as const;

export type ViewId = typeof VIEW_IDS[keyof typeof VIEW_IDS];
