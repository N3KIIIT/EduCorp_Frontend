'use client';

import React from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    Header,
    Cell,
    Switch,
    FormItem,
} from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { PROFILE_PANEL_IDS } from '@/shared/config/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from '@/core/theme/ThemeContext';
import { setLocale } from '@/core/i18n/locale';
import { NativeSelect } from '@vkontakte/vkui';

/**
 * Панель настроек профиля
 */
type Props = { id: string };

// ...

export const ProfileSettingsPanel: React.FC<Props> = ({ id }) => {
    const { goBackPanel } = useNavigationStore();
    const t = useTranslations('profile.settings');
    const { theme, setTheme } = useTheme();
    const locale = useLocale();

    return (
        <Panel id={id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
            >
                {t('title')}
            </PanelHeader>

            <Group header={<Header>{t('privacy')}</Header>}>
                <Cell
                    after={<Switch />}
                    multiline>
                    {t('publicProfile')}
                </Cell>

                <Cell
                    after={<Switch defaultChecked />}
                    multiline>
                    {t('showActivity')}
                </Cell>
            </Group>

            <Group header={<Header>{t('appearance.title')}</Header>}>
                <FormItem top={t('appearance.theme.title')}>
                    <NativeSelect
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                    >
                        <option value="light">{t('appearance.theme.light')}</option>
                        <option value="dark">{t('appearance.theme.dark')}</option>
                        <option value="system">{t('appearance.theme.system')}</option>
                    </NativeSelect>
                </FormItem>
                <FormItem top={t('appearance.language.title')}>
                    <NativeSelect
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                    >
                        <option value="en">{t('appearance.language.en')}</option>
                        <option value="ru">{t('appearance.language.ru')}</option>
                    </NativeSelect>
                </FormItem>
            </Group>

            <Group header={<Header>{t('notifications')}</Header>}>
                <Cell
                    after={<Switch defaultChecked />}
                    multiline
                >
                    {t('pushNotifications')}
                </Cell>
            </Group>
        </Panel>
    );
};

export default ProfileSettingsPanel;
