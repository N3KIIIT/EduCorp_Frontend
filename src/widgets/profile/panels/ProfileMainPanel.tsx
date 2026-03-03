'use client';

import React from 'react';
import {
    Panel,
    PanelHeader,
    Group,
    Header,
    Cell,
    Avatar,
} from '@vkontakte/vkui';
import { Icon24Airplay, Icon24Settings } from '@vkontakte/icons';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useSessionStore } from '@/entities/session/model/store';
import { PROFILE_PANEL_IDS } from '@/shared/config/navigation';

type Props = { id: string };

import { useTranslations } from 'next-intl';

// ...

export const ProfileMainPanel: React.FC<Props> = ({ id }) => {
    const { goToPanel } = useNavigationStore();
    const { user } = useSessionStore();
    const t = useTranslations('profile');

    if (!user) return null;

    return (
        <Panel id={id}>
            <PanelHeader>{t('title')}</PanelHeader>

            <Group>
                <Cell
                    before={
                        user.telegramData?.photoUrl ? (
                            <Avatar src={user.telegramData.photoUrl} size={72} />
                        ) : (
                            <Avatar initials={user.firstName[0]} size={72} />
                        )
                    }
                    multiline
                >
                    {user.fullName}
                </Cell>
            </Group>

            <Group header={<Header>{t('actions')}</Header>}>
                <Cell
                    before={<Icon24Airplay />}
                    onClick={() => goToPanel(PROFILE_PANEL_IDS.EDIT)}
                >
                    {t('edit.button')}
                </Cell>

                <Cell
                    before={<Icon24Settings />}
                    onClick={() => goToPanel(PROFILE_PANEL_IDS.SETTINGS)}
                >
                    {t('settings.button')}
                </Cell>
            </Group>
        </Panel>
    );
};

export default ProfileMainPanel;