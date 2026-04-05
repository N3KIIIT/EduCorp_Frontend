'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    UserResponse,
    PermissionResponse,
} from '@/lib/api-client/types.gen';

const USERS_QUERY_KEY = ['users'];

export const userKeys = {
    all: USERS_QUERY_KEY,
    me: [...USERS_QUERY_KEY, 'me'] as const,
    detail: (userId: string) => [...USERS_QUERY_KEY, 'detail', userId] as const,
    permissions: (userId: string) => [...USERS_QUERY_KEY, 'permissions', userId] as const,
};

/**
 * Текущий авторизованный пользователь.
 */
export const useCurrentUser = () => {
    return useQuery({
        queryKey: userKeys.me,
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Users/Me',
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as UserResponse;
        },
    });
};

/**
 * Пользователь по ID.
 */
export const useUser = (userId: string) => {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Users/{id}',
                path: { id: userId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as UserResponse;
        },
        enabled: !!userId,
    });
};

/**
 * Удаление пользователя (admin-only).
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await apiClient.delete<void>({
                url: '/Users/{id}',
                path: { id: userId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
};

/**
 * Список разрешений пользователя.
 */
export const useUserPermissions = (userId: string) => {
    return useQuery({
        queryKey: userKeys.permissions(userId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Users/{userId}/permissions',
                path: { userId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as Array<PermissionResponse>;
        },
        enabled: !!userId,
    });
};
