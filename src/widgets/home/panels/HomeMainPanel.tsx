'use client';

import React from 'react';
import { Panel, PanelHeader, } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useSessionStore } from '@/entities/session/model/store';

interface Props {
    id: string
}

import { useTranslations } from 'next-intl';

export const HomeMainPanel: React.FC<Props> = ({ id }) => {
    const { goToPanel } = useNavigationStore();
    const { user } = useSessionStore();
    const t = useTranslations('home');

    if (!user) return null;

    return (
        <Panel id={id}>
            <PanelHeader>{t('title')}</PanelHeader>
        </Panel>
    );
};

export default HomeMainPanel;