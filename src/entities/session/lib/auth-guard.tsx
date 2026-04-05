'use client';

import React from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useSessionStore } from '../model/store';
import { useTranslations } from 'next-intl';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    requireAll?: boolean; // Если true, требуются ВСЕ permissions/roles
    fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requiredPermissions = [],
    requiredRoles = [],
    requireAll = false,
    fallback,
}) => {
    const t = useTranslations('auth.guard');
    const pathname = usePathname();
    const {
        isAuthenticated,
        user,
        hasPermission,
        hasRole,
        hasAnyRole,
        hasAllPermissions
    } = useSessionStore();

    if (!isAuthenticated || !user) {
        if (pathname !== '/') {
            redirect('/');
        }
        return null;
    }

    if (requiredRoles.length > 0) {
        const hasRequiredRoles = requireAll
            ? requiredRoles.every(role => hasRole(role))
            : hasAnyRole(requiredRoles);

        if (!hasRequiredRoles) {
            return fallback || (
                <></>
            );
        }
    }

    if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requireAll
            ? hasAllPermissions(requiredPermissions)
            : requiredPermissions.some(permission => hasPermission(permission));

        if (!hasRequiredPermissions) {
            return fallback || (
                <div>
                </div>
            );
        }
    }

    return <>{children}</>;
};
export default AuthGuard
