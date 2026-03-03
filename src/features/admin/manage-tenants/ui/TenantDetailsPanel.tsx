'use client';

import React, {useState} from 'react';
import {Group, NavIdProps, Panel, PanelHeader, PanelHeaderBack, Placeholder, Tabs, TabsItem} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useNavigationStore} from '@/shared/lib/navigation/store';
import {useTenant} from '../api/admin-api';
import TenantUsersList from './TenantUsersList';
import {TenantSettings} from './TenantSettings';
import TenantInviteLinks from './TenantInviteLinks';
import {TenantGeneralResponse} from '@/lib/api-client/types.gen';

export const TenantDetailsPanel: React.FC<NavIdProps> = ({id}) => {
    const t = useTranslations('admin.tenants.details');
    const {goBackPanel, selectedTenantId} = useNavigationStore();
    const {data, isLoading} = useTenant(selectedTenantId || '');
    const tenant = data as TenantGeneralResponse | undefined;
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'inviteLinks'>('users');

    if (isLoading) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel}/>}>
                    {t('title')}
                </PanelHeader>
                <Placeholder>Loading tenant data...</Placeholder>
            </Panel>
        );
    }

    if (!tenant) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel}/>}>
                    {t('title')}
                </PanelHeader>
                <Placeholder>Tenant not found</Placeholder>
            </Panel>
        );
    }

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel}/>}>
                {tenant.tenantName}
            </PanelHeader>

            <Tabs mode="secondary" style={{ display: 'flex', justifyContent: 'center' }}>
                <TabsItem
                    selected={activeTab === 'users'}
                    onClick={() => setActiveTab('users')}
                >
                    {t('users')}
                </TabsItem>
                <TabsItem
                    selected={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                >
                    {t('settings')}
                </TabsItem>
                <TabsItem
                    selected={activeTab === 'inviteLinks'}
                    onClick={() => setActiveTab('inviteLinks')}
                >
                    {t('inviteLinks')}
                </TabsItem>
            </Tabs>

            <Group>
                {activeTab === 'users' && (
                    <TenantUsersList tenantId={tenant.tenantId} users={tenant.users}/>
                )}
                {activeTab === 'settings' && (
                    <TenantSettings tenant={tenant}/>
                )}
                {activeTab === 'inviteLinks' && (
                    <TenantInviteLinks tenantId={tenant.tenantId}/>
                )}
            </Group>
        </Panel>
    );
};
