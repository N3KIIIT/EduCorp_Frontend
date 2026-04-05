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
    ReorderContentBlocksRequest,
    UploadMediaContentCommand,
    GetMediaLibraryQuery,
    SearchMediaLibraryQuery,
    PagedResponseOfContentBlockBriefResponse,
} from '@/lib/api-client/types.gen';

const CONTENT_BLOCKS_QUERY_KEY = ['education', 'content-blocks'];

const contentBlockKeys = {
    all: CONTENT_BLOCKS_QUERY_KEY,
    byLesson: (lessonId: string) => [...CONTENT_BLOCKS_QUERY_KEY, 'byLesson', lessonId] as const,
    detail: (contentBlockId: string) => [...CONTENT_BLOCKS_QUERY_KEY, 'detail', contentBlockId] as const,
};

// Type aliases for cleaner usage
export type ContentBlock = ContentBlockResponse;
export type ContentBlockBrief = ContentBlockBriefResponse;
export type { IContentBlockDataRequest as ContentBlockDataRequest };

export const useContentBlocks = (lessonId: string) => {
    return useQuery({
        queryKey: contentBlockKeys.byLesson(lessonId),
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/ContentBlocks/ByLesson/{lessonId}',
                path: { lessonId },
                body: { page: 1, pageSize: 50 } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfContentBlockBriefResponse).items ?? [];
        },
        enabled: !!lessonId,
    });
};

export const useCreateContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddContentBlockRequest) => {
            const response = await apiClient.post({
                url: '/ContentBlocks',
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentBlockKeys.byLesson(variables.lessonId) });
        }
    });
};

export const useUpdateContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateContentBlockRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/ContentBlocks/{id}',
                path: { id },
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contentBlockKeys.detail(variables.id) });
        }
    });
};

export const useDeleteContentBlock = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contentBlockId: string) => {
            const response = await apiClient.delete<void>({
                url: '/ContentBlocks/{id}',
                path: { id: contentBlockId }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, contentBlockId) => {
            queryClient.invalidateQueries({ queryKey: contentBlockKeys.detail(contentBlockId) });
            queryClient.invalidateQueries({ queryKey: contentBlockKeys.all });
        }
    });
};

export const useContentBlock = (contentBlockId: string) => {
    return useQuery({
        queryKey: contentBlockKeys.detail(contentBlockId),
        queryFn: async () => {
            const response = await apiClient.get<ContentBlockResponse>({
                url: '/ContentBlocks/{id}',
                path: { id: contentBlockId }
            });

            if (!response.data) throw new Error('No data received');
            return response.data;
        },
        enabled: !!contentBlockId,
    });
};

export const useContentBlocksByCourse = (courseId: string) => {
    return useQuery({
        queryKey: [...CONTENT_BLOCKS_QUERY_KEY, 'byCourse', courseId],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/ContentBlocks/ByCourse/{courseId}',
                path: { courseId },
                body: { page: 1, pageSize: 100 } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfContentBlockBriefResponse).items ?? [];
        },
        enabled: !!courseId,
    });
};

export const useReorderContentBlocks = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ReorderContentBlocksRequest) => {
            const response = await apiClient.post({
                url: '/ContentBlocks/Reorder',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONTENT_BLOCKS_QUERY_KEY });
        },
    });
};

export const useUploadMedia = () => {
    return useMutation({
        mutationFn: async (request: UploadMediaContentCommand) => {
            const response = await apiClient.post({
                url: '/ContentBlocks/UploadMedia',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data;
        },
    });
};

export const useDeleteMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (mediaId: string) => {
            const response = await apiClient.delete<void>({
                url: '/ContentBlocks/Media/{id}',
                path: { id: mediaId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...CONTENT_BLOCKS_QUERY_KEY, 'media'] });
        },
    });
};

export const useMediaLibrary = (query: GetMediaLibraryQuery, enabled = true) => {
    return useQuery({
        queryKey: [...CONTENT_BLOCKS_QUERY_KEY, 'media', 'library', query],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/ContentBlocks/MediaLibrary',
                body: query,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled,
    });
};

export const useSearchMediaLibrary = (query: SearchMediaLibraryQuery, enabled = true) => {
    return useQuery({
        queryKey: [...CONTENT_BLOCKS_QUERY_KEY, 'media', 'search', query],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/ContentBlocks/MediaLibrary/Search',
                body: query,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled,
    });
};
