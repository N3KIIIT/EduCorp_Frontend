import React, { ReactElement } from 'react';
import {
    Icon28HomeOutline,
    Icon28SearchOutline,
    Icon28UserCircleOutline,
    Icon28SettingsOutline,
    Icon28ServicesOutline,
} from '@vkontakte/icons';
import { VIEW_IDS, type ViewId } from '@/shared/config/navigation';


export interface TabItem {
    id: ViewId;
    text: string;
    icon: ReactElement;
}

export const TABS: readonly TabItem[] = [
    {
        id: VIEW_IDS.HOME,
        text: 'navigation.home',
        icon: <Icon28HomeOutline />,
    },
    {
        id: VIEW_IDS.SEARCH,
        text: 'navigation.search',
        icon: <Icon28SearchOutline />,
    },
    {
        id: VIEW_IDS.PROFILE,
        text: 'navigation.profile',
        icon: <Icon28UserCircleOutline />,
    },
    {
        id: VIEW_IDS.ADMIN,
        text: 'navigation.admin',
        icon: <Icon28ServicesOutline />,
    }
] as const;

export const ID_TO_TAB = TABS.reduce((acc, tab) => {
    acc[tab.id] = tab;
    return acc;
}, {} as Record<ViewId, TabItem>);
