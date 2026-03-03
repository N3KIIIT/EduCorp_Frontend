'use client';

import { useTranslations } from 'next-intl';
import { Epic } from "@vkontakte/vkui";
import { TabBar } from "@/widgets/navigation/ui/TabBar";
import React, { useCallback } from "react";
import { useNavigationStore } from "@/shared/lib/navigation/store";
import { VIEW_IDS, ViewId } from "@/shared/config/navigation";
import { HomeView } from "@/widgets/home/HomeView";
import { SearchView } from "@/widgets/search/SearchView";
import { ProfileView } from "@/widgets/profile/ProfileView";
import { AdminView } from "@/widgets/admin/AdminView";


export default function Home() {
    const t = useTranslations('i18n');
    const {
        activeView,
        activePanels,
        setActiveView,
        activePopout,
    } = useNavigationStore();

    const handleTabChange = useCallback((tabId: ViewId) => {
        setActiveView(tabId);
    }, [setActiveView]);

    return (
        <>
            <Epic
                activeStory={activeView}
                tabbar={
                    <TabBar
                        activeTab={activeView}
                        onTabChange={handleTabChange}
                    />
                }
            >
                <HomeView id={VIEW_IDS.HOME} />
                <SearchView id={VIEW_IDS.SEARCH} />
                <ProfileView id={VIEW_IDS.PROFILE} />
                <AdminView id={VIEW_IDS.ADMIN} />
            </Epic>
        </>
    );
}
