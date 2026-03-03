
import {VIEW_IDS, ViewId} from "@/shared/config/navigation/view-ids";


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
    DETAILS: 'admin-tenant-details'
} as const;
export type AdminPanelId = typeof ADMIN_PANEL_IDS[keyof typeof ADMIN_PANEL_IDS];

export type PanelId =
    | HomePanelId
    | SearchPanelId
    | ProfilePanelId
    | SettingsPanelId
    | AdminPanelId;


export const DEFAULT_PANELS: Record<ViewId, PanelId> = {
    [VIEW_IDS.HOME]: HOME_PANEL_IDS.MAIN,
    [VIEW_IDS.SEARCH]: SEARCH_PANEL_IDS.MAIN,
    [VIEW_IDS.PROFILE]: PROFILE_PANEL_IDS.MAIN,
    [VIEW_IDS.ADMIN]: ADMIN_PANEL_IDS.MAIN,
} as const;
