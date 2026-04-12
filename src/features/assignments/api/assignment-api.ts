'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    AssignmentBriefResponse,
    AssignmentsFilter,
    CreateAssignmentRequest,
    AssignToDepartmentRequest,
} from '../types';

const assignmentKeys = {
    all: ['assignments'] as const,
    lists: () => [...assignmentKeys.all, 'list'] as const,
    filtered: (filters: AssignmentsFilter) => [...assignmentKeys.lists(), filters] as const,
    my: () => [...assignmentKeys.all, 'my'] as const,
};

export const useMyAssignments = () => {
    return useQuery({
        queryKey: assignmentKeys.my(),
        queryFn: async (): Promise<AssignmentBriefResponse[]> => {
            const response = await apiClient.get({
                url: '/assignments/my',
            });
            if (response.error) throw response.error;
            return (response.data as AssignmentBriefResponse[]) ?? [];
        },
    });
};

export const useAssignments = (filters: AssignmentsFilter = {}) => {
    const { page = 1, pageSize = 50, ...rest } = filters;
    const hasFilters = Object.values(rest).some(Boolean);

    return useQuery({
        queryKey: assignmentKeys.filtered(filters),
        queryFn: async (): Promise<AssignmentBriefResponse[]> => {
            const params: Record<string, string | number> = { page, pageSize };
            if (rest.courseId) params.courseId = rest.courseId;
            if (rest.userId) params.userId = rest.userId;
            if (rest.departmentId) params.departmentId = rest.departmentId;
            if (rest.status) params.status = rest.status;

            const query = new URLSearchParams(
                Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
            ).toString();

            const response = await apiClient.get({
                url: `/assignments?${query}`,
            });
            if (response.error) throw response.error;
            const data = response.data as { items?: AssignmentBriefResponse[] } | AssignmentBriefResponse[] | undefined;
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return data.items ?? [];
        },
        enabled: true,
    });
};

export const useCreateAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateAssignmentRequest): Promise<string> => {
            const response = await apiClient.post({
                url: '/assignments',
                body: request,
            });
            if (response.error) throw response.error;
            return response.data as string;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};

export const useAssignToDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: AssignToDepartmentRequest): Promise<number> => {
            const response = await apiClient.post({
                url: '/assignments/department',
                body: request,
            });
            if (response.error) throw response.error;
            return response.data as number;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};

export const useRevokeAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete({
                url: '/assignments/{id}',
                path: { id },
            });
            if (response.error) throw response.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};
