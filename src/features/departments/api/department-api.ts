'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    DepartmentBriefResponse,
    DepartmentResponse,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    AddEmployeeRequest,
} from '../types';

const departmentKeys = {
    all: ['departments'] as const,
    lists: () => [...departmentKeys.all, 'list'] as const,
    detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
};

export const useDepartments = () => {
    return useQuery({
        queryKey: departmentKeys.lists(),
        queryFn: async (): Promise<DepartmentBriefResponse[]> => {
            const response = await apiClient.get({
                url: '/departments',
            });
            if (response.error) throw response.error;
            const data = response.data as { items?: DepartmentBriefResponse[]; data?: DepartmentBriefResponse[] } | DepartmentBriefResponse[] | undefined;
            if (!data) return [];
            if (Array.isArray(data)) return data;
            return data.items ?? data.data ?? [];
        },
    });
};

export const useDepartment = (id: string) => {
    return useQuery({
        queryKey: departmentKeys.detail(id),
        queryFn: async (): Promise<DepartmentResponse> => {
            const response = await apiClient.get({
                url: '/departments/{id}',
                path: { id },
            });
            if (response.error) throw response.error;
            if (!response.data) throw new Error('No data');
            return response.data as DepartmentResponse;
        },
        enabled: !!id,
    });
};

export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: CreateDepartmentRequest): Promise<string> => {
            const response = await apiClient.post({
                url: '/departments',
                body: request,
            });
            if (response.error) throw response.error;
            return response.data as string;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        },
    });
};

export const useUpdateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateDepartmentRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/departments/{id}',
                path: { id },
                body: request,
            });
            if (response.error) throw response.error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        },
    });
};

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete({
                url: '/departments/{id}',
                path: { id },
            });
            if (response.error) throw response.error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        },
    });
};

export const useAddEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ departmentId, ...request }: AddEmployeeRequest & { departmentId: string }) => {
            const response = await apiClient.post({
                url: '/departments/{id}/employees',
                path: { id: departmentId },
                body: request,
            });
            if (response.error) throw response.error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.departmentId) });
            queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        },
    });
};

export const useRemoveEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ departmentId, userId }: { departmentId: string; userId: string }) => {
            const response = await apiClient.delete({
                url: '/departments/{id}/employees/{userId}',
                path: { id: departmentId, userId },
            });
            if (response.error) throw response.error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.departmentId) });
            queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        },
    });
};
