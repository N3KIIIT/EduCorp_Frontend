'use client';

import React, {useState} from 'react';
import {Group, NavIdProps, Panel, PanelHeader, Tabs, TabsItem} from '@vkontakte/vkui';
import {Icon24Services} from '@vkontakte/icons';
import {TenantManagement} from '@/features/admin/manage-tenants/ui/TenantManagement';

export const AdminDashboard: React.FC<NavIdProps> = ({id}) => {
    const [activeTab, setActiveTab] = useState<'tenants' | 'users'>('tenants');

    return (
        <Panel id={id}>
            <PanelHeader>Админ-панель</PanelHeader>

            <Tabs mode="secondary">
                <TabsItem
                    selected={activeTab === 'tenants'}
                    onClick={() => setActiveTab('tenants')}
                    before={<Icon24Services/>}
                >
                    Тенеанты
                </TabsItem>
            </Tabs>

            <Group>
                <TenantManagement/>
            </Group>
        </Panel>
    );
};
