'use client';

import {useMutation, useQuery, useQueryClient, useInfiniteQuery} from '@tanstack/react-query';
import {apiClient} from '@/shared/api/base-client';
import type {
    GenerateInviteRequest,
    InviteStatus,
    PagedResponseOfTenantLinkResponse,
} from '@/lib/api-client/types.gen';

const INVITE_LINKS_QUERY_KEY = ['admin', 'inviteLinks'];

export const useInviteLinks = (
    tenantId: string,
    page: number,
    pageSize: number,
    statusFilter?: InviteStatus,
    sortField: string = 'CreatedAt',
    isDescending: boolean = true
) => {
    return useQuery({
        queryKey: [...INVITE_LINKS_QUERY_KEY, tenantId, page, pageSize, statusFilter, sortField, isDescending],
        queryFn: async () => {
            const response = await apiClient.get<PagedResponseOfTenantLinkResponse>({
                url: '/Tenants/GetTenantInviteLinks/{tenantId}',
                path: { tenantId },
                query: { page, pageSize, status: statusFilter, sortField, isDescending },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!tenantId,
    });
};

export const useInfiniteInviteLinks = (
    tenantId: string,
    pageSize: number,
    statusFilter?: InviteStatus,
    sortField: string = 'CreatedAt',
    isDescending: boolean = true
) => {
    return useInfiniteQuery<PagedResponseOfTenantLinkResponse, Error>({
        queryKey: [...INVITE_LINKS_QUERY_KEY, 'infinite', tenantId, statusFilter, sortField, isDescending],
        queryFn: async ({ pageParam = 1 }): Promise<PagedResponseOfTenantLinkResponse> => {
            const response = await apiClient.get<PagedResponseOfTenantLinkResponse>({
                url: '/Tenants/GetTenantInviteLinks/{tenantId}',
                path: { tenantId },
                query: { page: pageParam as number, pageSize, status: statusFilter, sortField, isDescending },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfTenantLinkResponse;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            const lastPageNum = Number(lastPage.page);
            return lastPage.hasNextPage ? lastPageNum + 1 : undefined;
        },
        enabled: !!tenantId
    });
};

export const useGenerateInviteLink = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: Omit<GenerateInviteRequest, 'tenantId'>) => {
            const response = await apiClient.post({
                url: '/Tenants/GenerateInviteLink',
                body: { tenantId, ...request } satisfies GenerateInviteRequest
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as string;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...INVITE_LINKS_QUERY_KEY, tenantId] });
        }
    });
};

export const useRevokeInviteLink = (tenantId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (token: string) => {
            const response = await apiClient.post<void>({
                url: '/Tenants/RevokeTenantInvite/{token}',
                path: { token },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...INVITE_LINKS_QUERY_KEY, tenantId] });
        }
    });
};
