'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    RoleResponse,
    RoleRequest,
    RoleUpdateRequest,
    PermissionResponse,
    AssignPermissionRequest,
    RevokePermissionRequest,
} from '@/lib/api-client/types.gen';

const ROLES_QUERY_KEY = ['admin', 'roles'];

const roleKeys = {
    all: ROLES_QUERY_KEY,
    byTenant: (tenantId: string) => [...ROLES_QUERY_KEY, 'byTenant', tenantId] as const,
    detail: (roleId: string) => [...ROLES_QUERY_KEY, 'detail', roleId] as const,
    permissions: [...ROLES_QUERY_KEY, 'permissions'] as const,
    userPermissions: (userId: string) => [...ROLES_QUERY_KEY, 'userPermissions', userId] as const,
    userRoles: (userId: string) => [...ROLES_QUERY_KEY, 'userRoles', userId] as const,
};

/**
 * Роль по ID.
 */
export const useRole = (roleId: string) => {
    return useQuery({
        queryKey: roleKeys.detail(roleId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Roles/{id}',
                path: { id: roleId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as RoleResponse;
        },
        enabled: !!roleId,
    });
};

/**
 * Список всех доступных разрешений в системе.
 */
export const useAllPermissions = () => {
    return useQuery({
        queryKey: roleKeys.permissions,
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Roles/Permissions',
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as Array<PermissionResponse>;
        },
    });
};

/**
 * Все разрешения конкретного пользователя.
 */
export const useUserPermissionsByRole = (userId: string) => {
    return useQuery({
        queryKey: roleKeys.userPermissions(userId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Roles/UserPermissions/{userId}',
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

/**
 * Все роли конкретного пользователя.
 */
export const useUserRoles = (userId: string) => {
    return useQuery({
        queryKey: roleKeys.userRoles(userId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Roles/UserRoles/{userId}',
                path: { userId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as Array<RoleResponse>;
        },
        enabled: !!userId,
    });
};

/**
 * Создание новой роли.
 */
export const useCreateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: RoleRequest) => {
            const response = await apiClient.post({
                url: '/Roles',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as RoleResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
};

/**
 * Обновление существующей роли.
 * Примечание: API принимает id через query-параметр (см. PutApiRolesByIdData).
 */
export const useUpdateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: RoleUpdateRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/Roles/{id}',
                query: { id },
                body: request satisfies RoleUpdateRequest,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as RoleResponse;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
};

/**
 * Назначение разрешения роли.
 */
export const useAssignPermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AssignPermissionRequest) => {
            const response = await apiClient.post({
                url: '/Roles/AssignPermission',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
};

/**
 * Отзыв разрешения у роли.
 */
export const useRevokePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: RevokePermissionRequest) => {
            const response = await apiClient.post({
                url: '/Roles/RevokePermission',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: roleKeys.all });
        },
    });
};
