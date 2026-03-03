'use client';

import React from 'react';
import { usePermissions } from '../lib/usePermissions';
import type { PermissionType, RoleType } from '@/shared/config/permissions';

interface PermissionGateProps {
    children: React.ReactNode;
    permissions?: PermissionType[];
    roles?: RoleType[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
    children,
    permissions = [],
    roles = [],
    requireAll = false,
    fallback = null,
}) => {
    const { can, is, isAny, canAll, canAny } = usePermissions();

    if (roles.length > 0) {
        const hasRoles = requireAll
            ? roles.every(role => is(role))
            : isAny(roles);

        if (!hasRoles) return <>{fallback}</>;
    }

    if (permissions.length > 0) {
        const hasPermissions = requireAll
            ? canAll(permissions)
            : canAny(permissions);

        if (!hasPermissions) return <>{fallback}</>;
    }

    return <>{children}</>;
};
