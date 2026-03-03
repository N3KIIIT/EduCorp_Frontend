'use client';

import { create } from 'zustand';
import type { User } from '@/entities/user/model/domain/User';
import { ROLES } from './constants';

interface SessionState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    tenantId: string | null;
    isAuthenticated: boolean;
}

interface SessionStore extends SessionState {
    setSession: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    clearSession: () => void;

    hasPermission: (permission: string) => boolean;
    hasRole: (role: string) => boolean;
    hasAnyRole: (roles: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    checkTenantAccess: (targetTenantId: string) => boolean;
}


export const useSessionStore = create<SessionStore>()((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    tenantId: null,
    isAuthenticated: false,

    setSession: (user, accessToken, refreshToken) => {
        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
        });
    },

    setUser: (user) => {
        set({
            user,
        });
    },

    clearSession: () => {
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },

    hasPermission: (permission: string): boolean => {
        const { user } = get();
        return user?.hasPermission(permission) ?? false;
    },

    hasRole: (role: string): boolean => {
        const { user } = get();
        return user?.hasRole(role) ?? false;
    },

    hasAnyRole: (roles: string[]): boolean => {
        const { user } = get();
        return user?.hasAnyRole(roles) ?? false;
    },

    hasAllPermissions: (permissions: string[]): boolean => {
        const { user } = get();
        return user?.hasAllPermissions(permissions) ?? false;
    },

    checkTenantAccess: (targetTenantId: string): boolean => {
        const { user, tenantId } = get();
        if (!user) return false;

        if (user.hasRole(ROLES.SUPER_ADMIN)) {
            return true;
        }

        return tenantId === targetTenantId;
    },
}));
