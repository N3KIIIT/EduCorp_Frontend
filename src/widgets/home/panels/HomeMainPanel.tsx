'use client';

import React from 'react';
import { Panel, PanelHeader } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useSessionStore } from '@/entities/session/model/store';
import { CoursesNewsTabs } from './CoursesNewsTabs';
import { PassCard } from '@/features/passes/ui/PassCard';
import { COURSE_PANEL_IDS } from "@/shared/config/navigation/panel-ids";

interface Props {
    id: string;
}

export const HomeMainPanel: React.FC<Props> = ({ id }) => {
    const { user } = useSessionStore();
    const t = useTranslations('home');

    if (!user) return null;

    return (
        <Panel id={id}>
            <PanelHeader>{t('title')}</PanelHeader>
            <PassCard />
            <CoursesNewsTabs id={COURSE_PANEL_IDS.MAIN} />
        </Panel>
    );
};

export default HomeMainPanel;
