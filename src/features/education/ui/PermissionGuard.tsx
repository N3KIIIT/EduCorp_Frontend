'use client';

import React from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import type { ROLES } from '@/entities/session/model/constants';

interface PermissionGuardProps {
    children: React.ReactNode;
    roles?: string[];
    permissions?: string[];
    fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    children,
    roles,
    permissions,
    fallback = null,
}) => {
    const { hasAnyRole, hasAllPermissions } = useSessionStore();

    const hasRoleAccess = roles ? hasAnyRole(roles.map(r => r)) : false;
    const hasPermissionAccess = permissions ? hasAllPermissions(permissions) : false;

    if (hasRoleAccess || hasPermissionAccess) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
