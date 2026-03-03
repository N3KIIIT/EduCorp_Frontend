'use client';

import React from 'react';
import {
    Group,
    Avatar,
    Placeholder,
    Card,
    Box, 
    ChipsSelect
} from '@vkontakte/vkui';
import { Icon24UserOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { TenantUserResponse } from '@/lib/api-client/types.gen';
import { useRoles, useRevokeRole, useUpdateUserRole } from '@/features/admin/manage-tenants/api/admin-api';

interface TenantUsersListProps {
    tenantId: string;
    users: TenantUserResponse[];
}

const TenantUsersList: React.FC<TenantUsersListProps> = ({ tenantId, users }) => {
    const t = useTranslations('admin.tenants.users');
    const { data: allRoles = [] } = useRoles(tenantId);
    const assignRole = useUpdateUserRole(tenantId);
    const revokeRole = useRevokeRole(tenantId);

    const handleAssignRole = (userId: string, role: string) => {
        if (!role) return;
        assignRole.mutate({ userId, role });
    };

    const handleRevokeRole = (userId: string, role: string) => {
        if (window.confirm(t('revokeConfirm'))) {
            revokeRole.mutate({ userId, role });
        }
    };

    if (users.length === 0) {
        return <Placeholder>No users found</Placeholder>;
    }

    return (
        <Group>
            <Box style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: 16, 
                padding: 16 
            }}>
                {users.map((user) => (
                    <Card key={user.userId} mode="outline" style={{ padding: 16 }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Avatar size={48} fallbackIcon={<Icon24UserOutline />} />
                            <span style={{ fontSize: 17, fontWeight: 600 }}>{user.firstName}</span>
                        </Box>
                        
                        <ChipsSelect
                            placeholder={t('addRole')}
                            value={user.roles.map(r => ({ value: r.name, label: t(`roles.${r.name}`) }))}
                            options={allRoles.map(r => ({ value: r.name, label: t(`roles.${r.name}`) }))}
                            onChange={(newChips) => {
                                const currentRoles = user.roles.map(r => r.name);
                                const newRoles = newChips.map(c => c.value);

                                const addedRole = newRoles.find(r => !currentRoles.includes(r));
                                if (addedRole) {
                                    handleAssignRole(user.userId, addedRole as string);
                                }

                                const removedRole = currentRoles.find(r => !newRoles.includes(r));
                                if (removedRole) {
                                    handleRevokeRole(user.userId, removedRole);
                                }
                            }}
                            disabled={assignRole.isPending || revokeRole.isPending}
                            creatable={false}
                        />
                    </Card>
                ))}
            </Box>
        </Group>
    );
};
export default TenantUsersList
