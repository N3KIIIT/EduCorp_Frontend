'use client';

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiClient} from '@/shared/api/base-client';
import type {
    AssignRoleRequest,
    CreateTenantRequest,
    PostApiTenantsGetAllResponses,
    PostApiTenantsResponse,
    RoleResponse,
    TenantGeneralResponse,
    TenantResponse,
} from '@/lib/api-client/types.gen';

const TENANTS_QUERY_KEY = ['admin', 'tenants'];

export const useTenants = () => {
    return useQuery({
        queryKey: TENANTS_QUERY_KEY,
        queryFn: async () => {
            const response = await apiClient.post<PostApiTenantsGetAllResponses>({
                url: '/Tenants/GetAll',
                body: {
                    page: 1,
                    pageSize: 100
                }
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data.items as TenantResponse[];
        }
    });
};

export const useCreateTenant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateTenantRequest) => {
            const response = await apiClient.post<PostApiTenantsResponse>({
                url: '/Tenants',
                body: request
            });

            if (response.error) {
                throw response.error;
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
        }
    });
};

export const useTenant = (tenantId: string) => {
    return useQuery({
        queryKey: [...TENANTS_QUERY_KEY, tenantId],
        queryFn: async () => {
            const response = await apiClient.get<TenantGeneralResponse>({
                url: `/Tenants/${tenantId}`,
                query: { tenantId }
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!tenantId
    });
};

export const useUpdateUserRole = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            
            const request : AssignRoleRequest = {
                role: role
            };
            
            const response = await apiClient.post<void>({
                url: `/Users/${userId}/roles`,
                body: { role }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TENANTS_QUERY_KEY, tenantId] });
        }
    });
};

export const useRevokeRole = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            const response = await apiClient.delete<void>({
                url: `/Users/${userId}/roles/${role}`
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...TENANTS_QUERY_KEY, tenantId] });
        }
    });
};

export const useRoles = (tenantId: string) => {
    return useQuery({
        queryKey: ['admin', 'roles'],
        queryFn: async () => {
            const response = await apiClient.get<RoleResponse[]>({
                url: `/Roles/GetAll/${tenantId}`
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data.filter((role, index, self) =>
                index === self.findIndex((r) => r.name === role.name)
            );
        }
    });
};
