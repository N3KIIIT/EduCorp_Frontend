
import { VIEW_IDS, ViewId } from "@/shared/config/navigation/view-ids";


export const HOME_PANEL_IDS = {
    MAIN: 'home-main',
} as const;

export type HomePanelId = typeof HOME_PANEL_IDS[keyof typeof HOME_PANEL_IDS];


export const SEARCH_PANEL_IDS = {
    MAIN: 'search-main',
    RESULTS: 'search-results',
} as const;

export type SearchPanelId = typeof SEARCH_PANEL_IDS[keyof typeof SEARCH_PANEL_IDS];


export const PROFILE_PANEL_IDS = {
    MAIN: 'profile-main',
    EDIT: 'profile-edit',
    SETTINGS: 'profile-settings',
    ORGANIZATION: 'profile-organization',
} as const;

export type ProfilePanelId = typeof PROFILE_PANEL_IDS[keyof typeof PROFILE_PANEL_IDS];


export const SETTINGS_PANEL_IDS = {
    MAIN: 'settings-main',
    NOTIFICATIONS: 'settings-notifications',
    PRIVACY: 'settings-privacy',
    SECURITY: 'settings-security',
} as const;

export type SettingsPanelId = typeof SETTINGS_PANEL_IDS[keyof typeof SETTINGS_PANEL_IDS];

export const ADMIN_PANEL_IDS = {
    MAIN: 'admin-main',
    DETAILS: 'admin-tenant-details',
    COURSES: 'admin-courses',
    COURSE_DETAILS: 'admin-course-details',
    LESSONS: 'admin-lessons',
    LESSON_DETAILS: 'admin-lesson-details',
    TESTS: 'admin-tests',
    TEST_DETAILS: 'admin-test-details',
} as const;
export type AdminPanelId = typeof ADMIN_PANEL_IDS[keyof typeof ADMIN_PANEL_IDS];

export const COURSE_PANEL_IDS = {
    MAIN: 'course-main',
    DETAIL: 'course-details',
} as const;
export type CoursePanelId = typeof COURSE_PANEL_IDS[keyof typeof COURSE_PANEL_IDS]

export const LESSON_PANEL_IDS = {
    MAIN: 'lesson-main',
    DETAIL: 'lesson-details'
} as const;
export type LessonPanelId = typeof LESSON_PANEL_IDS[keyof typeof LESSON_PANEL_IDS]

export const TEST_PANEL_IDS = {
    MAIN: 'test-main',
    DETAIL: 'test-details',
    TAKE: 'test-take',
    ATTEMPTS: 'test-attempts',
    ATTEMPT_REVIEW: 'test-attempt-review',
} as const;
export type TestPanelId = typeof TEST_PANEL_IDS[keyof typeof TEST_PANEL_IDS]

export const NEWS_PANEL_IDS = {
    DETAIL: 'news-detail',
} as const;
export type NewsPanelId = typeof NEWS_PANEL_IDS[keyof typeof NEWS_PANEL_IDS]

export const PASS_PANEL_IDS = {
    DETAIL: 'pass-detail',
    SCAN: 'pass-scan',
    ADMIN_LIST: 'pass-admin-list',
} as const;
export type PassPanelId = typeof PASS_PANEL_IDS[keyof typeof PASS_PANEL_IDS];

export type PanelId =
    | HomePanelId
    | SearchPanelId
    | ProfilePanelId
    | SettingsPanelId
    | AdminPanelId
    | CoursePanelId
    | LessonPanelId
    | TestPanelId
    | NewsPanelId
    | PassPanelId;


export const DEFAULT_PANELS: Record<ViewId, PanelId> = {
    [VIEW_IDS.HOME]: HOME_PANEL_IDS.MAIN,
    [VIEW_IDS.SEARCH]: SEARCH_PANEL_IDS.MAIN,
    [VIEW_IDS.PROFILE]: PROFILE_PANEL_IDS.MAIN,
    [VIEW_IDS.ADMIN]: ADMIN_PANEL_IDS.MAIN,
} as const;
