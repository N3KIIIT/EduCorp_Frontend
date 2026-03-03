'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    ContentBlockResponse,
    ContentBlockBriefResponse,
    AddContentBlockRequest,
    UpdateContentBlockRequest,
    IContentBlockDataRequest,
    PagedRequest,
    PagedResponseOfContentBlockBriefResponse, PostApiContentBlocksByCourseByCourseIdResponses,
} from '@/lib/api-client/types.gen';

const CONTENT_BLOCKS_QUERY_KEY = ['education', 'content-blocks'];

// Type aliases for cleaner usage
export type ContentBlock = ContentBlockResponse;
export type ContentBlockBrief = ContentBlockBriefResponse;
export type { IContentBlockDataRequest as ContentBlockDataRequest };

export const useContentBlocks = (lessonId: string) => {
    return useQuery({
        queryKey: [...CONTENT_BLOCKS_QUERY_KEY, lessonId],
        queryFn: async () => {
            const response = await apiClient.post<PostApiContentBlocksByCourseByCourseIdResponses, PagedRequest>({
                url: '/ContentBlocks/ByLesson/{lessonId}',
                path: { lessonId },
                body: { page: 1, pageSize: 50 }
            });

            if (!response.data?.items) {
                throw new Error('No data received');
            }

            return response.data.items;
        },
        enabled: !!lessonId
    });
};

export const useCreateContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddContentBlockRequest) => {
            const response = await apiClient.post<unknown, AddContentBlockRequest>({
                url: '/ContentBlocks',
                body: request
            });

            return response.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...CONTENT_BLOCKS_QUERY_KEY, variables.lessonId] });
        }
    });
};

export const useUpdateContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateContentBlockRequest & { id: string }) => {
            const response = await apiClient.put<unknown, UpdateContentBlockRequest>({
                url: '/ContentBlocks/{id}',
                path: { id },
                body: request
            });

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_BLOCKS_QUERY_KEY });
        }
    });
};

export const useDeleteContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contentBlockId: string) => {
            await apiClient.delete<void>({
                url: '/ContentBlocks/{id}',
                path: { id: contentBlockId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_BLOCKS_QUERY_KEY });
        }
    });
};

export const useContentBlock = (contentBlockId: string) => {
    return useQuery({
        queryKey: [...CONTENT_BLOCKS_QUERY_KEY, contentBlockId],
        queryFn: async () => {
            const response = await apiClient.get<ContentBlockResponse>({
                url: '/ContentBlocks/{id}',
                path: { id: contentBlockId }
            });

            return response.data!;
        },
        enabled: !!contentBlockId
    });
};
