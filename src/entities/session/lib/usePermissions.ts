'use client';

import { useSessionStore } from '../model/store';
import type { PermissionType, RoleType } from '@/shared/config/permissions';

/**
 * Хук для упрощенной проверки прав и ролей в компонентах
 */
export const usePermissions = () => {
    const {
        hasPermission,
        hasRole,
        hasAnyRole,
        hasAllPermissions,
        isAuthenticated,
        user
    } = useSessionStore();

    return {
        isAuthenticated,
        user,
        /**
         * Проверяет наличие конкретного права
         */
        can: (permission: PermissionType) => hasPermission(permission),

        /**
         * Проверяет наличие роли
         */
        is: (role: RoleType) => hasRole(role),

        /**
         * Проверяет наличие хотя бы одной из ролей
         */
        isAny: (roles: RoleType[]) => hasAnyRole(roles as string[]),

        /**
         * Проверяет наличие всех указанных прав
         */
        canAll: (permissions: PermissionType[]) => hasAllPermissions(permissions as string[]),

        /**
         * Проверяет наличие хотя бы одного из указанных прав
         */
        canAny: (permissions: PermissionType[]) => 
            permissions.some(p => hasPermission(p)),

        /**
         * Удобный геттер для проверки на админа
         */
        isAdmin: hasRole('Admin') || hasRole('SuperAdmin'),
        
        /**
         * Удобный геттер для проверки на суперадмина
         */
        isSuperAdmin: hasRole('SuperAdmin'),
    };
};
