'use client';

import React from 'react';
import { View, NavIdProps } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import {ADMIN_PANEL_IDS, ViewId} from '@/shared/config/navigation';
import { AdminDashboard } from './ui/AdminDashboard';
import AuthGuard from '@/entities/session/lib/auth-guard';
import { ROLES } from '@/shared/config/permissions';

import { TenantDetailsPanel } from '@/features/admin/manage-tenants/ui/TenantDetailsPanel';
import { DepartmentDetailsPanel } from '@/features/departments/ui/DepartmentDetailsPanel';

export const AdminView: React.FC<NavIdProps> = ({ id }) => {
    const { activePanels } = useNavigationStore();

    return (
        <AuthGuard requiredRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
            <View id={id} activePanel={activePanels[id as ViewId] || ADMIN_PANEL_IDS.MAIN}>
                <AdminDashboard id={ADMIN_PANEL_IDS.MAIN} />
                <TenantDetailsPanel id={ADMIN_PANEL_IDS.DETAILS} />
                <DepartmentDetailsPanel id={ADMIN_PANEL_IDS.DEPARTMENT_DETAILS} />
            </View>
        </AuthGuard>
    );
};
