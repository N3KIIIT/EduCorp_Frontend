'use client';

import React from 'react';
import { Tabbar, TabbarItem } from '@vkontakte/vkui';
import { TABS, type TabItem } from '../config/tabs';
import type { ViewId } from '@/shared/config/navigation';

interface TabBarProps {
    activeTab: ViewId;
    onTabChange: (tabId: ViewId) => void;
}

import { useTranslations } from 'next-intl';


import { usePermissions } from '@/entities/session/lib/usePermissions';
import { VIEW_IDS } from '@/shared/config/navigation';

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const t = useTranslations();
    const { isAdmin } = usePermissions();

    const handleTabClick = (tab: TabItem) => {
        onTabChange(tab.id);
    };

    const filteredTabs = TABS.filter(tab => {
        if (tab.id === VIEW_IDS.ADMIN) {
            return isAdmin;
        }
        return true;
    });

    return (
        <Tabbar>
            {filteredTabs.map((tab) => (
                <TabbarItem
                    key={tab.id}
                    selected={activeTab === tab.id}
                    data-story={tab.id}
                    title={t(tab.text)}
                    onClick={() => handleTabClick(tab)}
                >
                    {tab.icon}
                </TabbarItem>
            ))}
        </Tabbar>
    );
};
