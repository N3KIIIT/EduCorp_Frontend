'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    NewsPostBriefResponse,
    NewsPostResponse,
    NewsCategoryResponse,
    CreateNewsPostRequest,
    UpdateNewsPostRequest,
    CreateNewsCategoryRequest,
} from '../types';

const newsKeys = {
    all: ['news'] as const,
    list: (params?: object) => ['news', 'list', params] as const,
    detail: (id: string) => ['news', 'detail', id] as const,
    categories: () => ['news', 'categories'] as const,
};

type NewsPostsParams = {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    status?: string;
};

type NewsPostsResponse = {
    items: NewsPostBriefResponse[];
    total: number;
};

export const useNewsPosts = (params?: NewsPostsParams) => {
    return useQuery({
        queryKey: newsKeys.list(params),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/news',
                query: params,
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /news');
            }

            return response.data as NewsPostsResponse;
        },
    });
};

export const useNewsPost = (id: string) => {
    return useQuery({
        queryKey: newsKeys.detail(id),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/news/{id}',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /news/{id}');
            }

            return response.data as NewsPostResponse;
        },
        enabled: !!id,
    });
};

export const useNewsCategories = () => {
    return useQuery({
        queryKey: newsKeys.categories(),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/news/categories',
            });

            if (response.error) {
                throw response.error;
            }

            if (!response.data) {
                throw new Error('No data received from /news/categories');
            }

            return response.data as NewsCategoryResponse[];
        },
    });
};

export const useCreateNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateNewsPostRequest) => {
            const response = await apiClient.post({
                url: '/news',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as string;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useUpdateNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateNewsPostRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/news/{id}',
                path: { id },
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useDeleteNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete({
                url: '/news/{id}',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const usePublishNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/news/{id}/Publish',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useUnpublishNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/news/{id}/Unpublish',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useArchiveNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/news/{id}/Archive',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const usePinNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/news/{id}/Pin',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useUnpinNewsPost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.post({
                url: '/news/{id}/Unpin',
                path: { id },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: newsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: newsKeys.list() });
        },
    });
};

export const useCreateNewsCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateNewsCategoryRequest) => {
            const response = await apiClient.post({
                url: '/news/categories',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as NewsCategoryResponse;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: newsKeys.categories() });
        },
    });
};
