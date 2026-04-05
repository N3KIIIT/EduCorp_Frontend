'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    AddLessonRequest,
    UpdateLessonRequest,
    LessonType,
    LessonResponse,
    LessonBriefResponse,
    PagedRequest,
    ReorderLessonsRequest,
    PagedResponseOfLessonBriefResponse,
    GetApiLessonsByIdWithContentResponses,
} from '@/lib/api-client/types.gen';

const LESSONS_QUERY_KEY = ['education', 'lessons'];

const lessonKeys = {
    all: LESSONS_QUERY_KEY,
    byCourse: (courseId: string) => [...LESSONS_QUERY_KEY, 'byCourse', courseId] as const,
    detail: (lessonId: string) => [...LESSONS_QUERY_KEY, 'detail', lessonId] as const,
};

export { LessonType };

export const useLessons = (courseId: string) => {
    return useQuery({
        queryKey: lessonKeys.byCourse(courseId),
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Lessons/ByCourse/{courseId}',
                path: { courseId },
                body: { page: 1, pageSize: 50 } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfLessonBriefResponse).items ?? [];
        },
        enabled: !!courseId,
    });
};

export const useCreateLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddLessonRequest) => {
            const response = await apiClient.post({
                url: '/Lessons',
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: lessonKeys.byCourse(variables.courseId) });
        }
    });
};

export const useUpdateLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateLessonRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/Lessons/{id}',
                path: { id },
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: lessonKeys.detail(variables.id) });
        }
    });
};

export const useDeleteLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lessonId: string) => {
            const response = await apiClient.delete<void>({
                url: '/Lessons/{id}',
                path: { id: lessonId }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, lessonId) => {
            queryClient.invalidateQueries({ queryKey: lessonKeys.detail(lessonId) });
            queryClient.invalidateQueries({ queryKey: lessonKeys.all });
        }
    });
};

export const useLesson = (lessonId: string) => {
    return useQuery({
        queryKey: lessonKeys.detail(lessonId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Lessons/{id}',
                path: { id: lessonId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as LessonResponse;
        },
        enabled: !!lessonId,
    });
};

export const useLessonWithContent = (lessonId: string) => {
    return useQuery({
        queryKey: [...lessonKeys.detail(lessonId), 'withContent'],
        queryFn: async () => {
            const response = await apiClient.get<GetApiLessonsByIdWithContentResponses>({
                url: '/Lessons/{id}/WithContent',
                path: { id: lessonId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as LessonResponse;
        },
        enabled: !!lessonId,
    });
};

export const useNextLesson = (lessonId: string) => {
    return useQuery({
        queryKey: [...lessonKeys.detail(lessonId), 'next'],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Lessons/{id}/Next',
                path: { id: lessonId },
            });

            return response.data as LessonBriefResponse | null;
        },
        enabled: !!lessonId,
        retry: false,
    });
};

export const usePreviousLesson = (lessonId: string) => {
    return useQuery({
        queryKey: [...lessonKeys.detail(lessonId), 'previous'],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Lessons/{id}/Previous',
                path: { id: lessonId },
            });

            return response.data as LessonBriefResponse | null;
        },
        enabled: !!lessonId,
        retry: false,
    });
};

export const useReorderLessons = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ReorderLessonsRequest) => {
            const response = await apiClient.post({
                url: '/Lessons/Reorder',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY });
        },
    });
};
