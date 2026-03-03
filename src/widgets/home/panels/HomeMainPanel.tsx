'use client';

import React, {useState} from 'react';
import { Panel, PanelHeader, } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useSessionStore } from '@/entities/session/model/store';
import { CoursesNewsTabs } from './CoursesNewsTabs';

interface Props {
    id: string
}

import { useTranslations } from 'next-intl';
import {CourseDetailsPanel} from "@/features/education/manage-courses/ui/CourseDetailsPanel";
import {COURSE_PANEL_IDS} from "@/shared/config/navigation/panel-ids";

export const HomeMainPanel: React.FC<Props> = ({ id }) => {
    const { user } = useSessionStore();
    const t = useTranslations('home');
    
    if (!user) return null;

    return (
        <Panel id={id}>
            <PanelHeader>
                {t('title')}
            </PanelHeader>
            <CoursesNewsTabs id={COURSE_PANEL_IDS.MAIN} />
            
        </Panel>
    );
};

export default HomeMainPanel;