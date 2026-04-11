'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    PassResponse,
    PassBriefResponse,
    SuspendPassRequest,
    ValidatePassRequest,
    PassScanResultResponse,
    PassScanLogResponse,
} from '../types';

const passKeys = {
    all: ['passes'],
    myPass: () => ['passes', 'my'],
    list: (params?: object) => ['passes', 'list', params],
    detail: (id: string) => ['passes', 'detail', id],
    scanLogs: (id: string) => ['passes', 'scan-logs', id],
};

type PassesParams = {
    page?: number;
    pageSize?: number;
};

type PassesResponse = {
    items: PassBriefResponse[];
    total: number;
};

type PassScanLogsParams = {
    page?: number;
    pageSize?: number;
};

// How many ms before tokenExpiresAt we proactively refetch (30 seconds)
const TOKEN_REFRESH_LEAD_MS = 30_000;

export const useMyPass = () => {
    return useQuery({
        queryKey: passKeys.myPass(),
        queryFn: async (): Promise<PassResponse | null> => {
            const response = await apiClient.get({
                url: '/passes/my',
            });

            if (response.error) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const status = (response.error as any)?.status ?? (response.error as any)?.statusCode;
                if (status === 404) return null;
                throw response.error;
            }

            return (response.data as PassResponse) ?? null;
        },
        // Schedule next refetch so it fires TOKEN_REFRESH_LEAD_MS before the token expires.
        // The backend regenerates the token on every GET, so this keeps the QR always fresh.
        refetchInterval: (query) => {
            const pass = query.state.data;
            if (!pass?.tokenExpiresAt) return false;
            const msUntilRefresh =
                new Date(pass.tokenExpiresAt).getTime() - Date.now() - TOKEN_REFRESH_LEAD_MS;
            // If already past refresh window — refetch immediately (but at least 1s gap)
            return Math.max(msUntilRefresh, 1_000);
        },
        // Always treat as stale so background refetch updates the QR
        staleTime: 0,
    });
};

export const usePass = (id: string) => {
    return useQuery({
        queryKey: passKeys.detail(id),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/passes/{id}',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /passes/{id}');
            }

            return response.data as PassResponse;
        },
        enabled: !!id,
    });
};

export const usePasses = (params?: PassesParams) => {
    return useQuery({
        queryKey: passKeys.list(params),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/passes',
                query: params,
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /passes');
            }

            return response.data as PassesResponse;
        },
    });
};

export const usePassScanLogs = (passId: string, params?: PassScanLogsParams) => {
    return useQuery({
        queryKey: passKeys.scanLogs(passId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/passes/{id}/ScanLogs',
                path: { id: passId },
                query: params,
            });

            if (response.error) {
                throw response.error;
            }

            return (response.data as PassScanLogResponse[]) ?? [];
        },
        enabled: !!passId,
    });
};

export const useSuspendPass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...body }: SuspendPassRequest & { id: string }) => {
            const response = await apiClient.post({
                url: '/passes/{id}/Suspend',
                path: { id },
                body,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: passKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: passKeys.list() });
            queryClient.invalidateQueries({ queryKey: passKeys.myPass() });
        },
    });
};

export const useReinstatePass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/passes/{id}/Reinstate',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: passKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: passKeys.list() });
            queryClient.invalidateQueries({ queryKey: passKeys.myPass() });
        },
    });
};

export const useRevokePass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/passes/{id}/Revoke',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: passKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: passKeys.list() });
            queryClient.invalidateQueries({ queryKey: passKeys.myPass() });
        },
    });
};

export const useValidatePass = () => {
    return useMutation({
        mutationFn: async (request: ValidatePassRequest) => {
            const response = await apiClient.post({
                url: '/passes/Validate',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /passes/Validate');
            }

            return response.data as PassScanResultResponse;
        },
    });
};
