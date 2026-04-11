'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    OrganizationInfoResponse,
    UpdateOrganizationInfoRequest,
} from '../types';

const organizationKeys = {
    info: () => ['organization', 'info'] as const,
};

export const useOrganizationInfo = () => {
    return useQuery({
        queryKey: organizationKeys.info(),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/organization',
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /organization');
            }

            return response.data as OrganizationInfoResponse;
        },
    });
};

export const useUpdateOrganizationInfo = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: UpdateOrganizationInfoRequest) => {
            const response = await apiClient.put({
                url: '/organization',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as OrganizationInfoResponse | undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.info() });
        },
    });
};
