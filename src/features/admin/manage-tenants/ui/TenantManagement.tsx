'use client';

import React, { useState } from 'react';
import {
    Group,
    Header,
    Cell,
    InfoRow,
    Placeholder,
    Button,
} from '@vkontakte/vkui';
import { Icon24Add } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useTenants } from '../api/admin-api';
import { TenantCreateModal } from './TenantCreateModal';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { ADMIN_PANEL_IDS } from '@/shared/config/navigation';
import AuthGuard from "@/entities/session/lib/auth-guard";
import {ROLES} from "@/entities/session";

export const TenantManagement: React.FC = () => {
    const t = useTranslations('admin.tenants');
    const tCommon = useTranslations('common');
    const { data: tenants = [], isLoading } = useTenants();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { goToPanel, setSelectedTenantId } = useNavigationStore();

    return (
        <Group header={
            <Header indicator={
                <AuthGuard requiredRoles={[ROLES.SUPER_ADMIN]}>
                    <Button
                        before={<Icon24Add />}
                        onClick={() => setIsModalOpen(true)}
                        size="s"
                        mode="tertiary"
                    >
                        {t('add')}
                    </Button>
                </AuthGuard>
            }>
                {t('title')}
            </Header>
        }>
            {isLoading ? (
                <Placeholder>{tCommon('loading')}</Placeholder>
            ) : tenants.length === 0 ? (
                <Placeholder>{t('empty')}</Placeholder>
            ) : (
                tenants.map(tenant => (
                    <Cell 
                        key={tenant.id}
                        onClick={() => {
                            setSelectedTenantId(tenant.id);
                            goToPanel(ADMIN_PANEL_IDS.DETAILS);
                        }}
                    >
                        <InfoRow header={tenant.name}>
                            {tenant.subdomain}.example.com ({t(`statusValues.${tenant.status}`)})
                        </InfoRow>
                    </Cell>
                ))
            )}

            {isModalOpen && (
                <TenantCreateModal onClose={() => setIsModalOpen(false)} />
            )}
        </Group>
    );
};
