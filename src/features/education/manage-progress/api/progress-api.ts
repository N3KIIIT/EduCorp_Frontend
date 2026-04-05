'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    CourseProgressResponse,
    PagedRequest,
    PagedResponseOfCourseProgressResponse,
    StartCourseCommand,
    ContinueCourseCommand,
    CompleteLessonCommand,
    CompleteCourseCommand,
    ResetCourseProgressCommand,
} from '@/lib/api-client/types.gen';

const PROGRESS_QUERY_KEY = ['education', 'progress'];

const progressKeys = {
    all: PROGRESS_QUERY_KEY,
    byCourse: (courseId: string) => [...PROGRESS_QUERY_KEY, 'byCourse', courseId] as const,
    withLessons: (courseId: string) => [...PROGRESS_QUERY_KEY, 'withLessons', courseId] as const,
    stats: (courseId: string) => [...PROGRESS_QUERY_KEY, 'stats', courseId] as const,
    user: [...PROGRESS_QUERY_KEY, 'user'] as const,
    summary: [...PROGRESS_QUERY_KEY, 'user', 'summary'] as const,
};

/**
 * Начало прохождения курса.
 */
export const useStartCourseProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: StartCourseCommand) => {
            const response = await apiClient.post({
                url: '/CoursesProgress/Start',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: progressKeys.byCourse(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.user });
        },
    });
};

/**
 * Продолжение прохождения курса.
 */
export const useContinueCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ContinueCourseCommand) => {
            const response = await apiClient.post({
                url: '/CoursesProgress/Continue',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: progressKeys.byCourse(variables.courseId) });
        },
    });
};

/**
 * Завершение урока.
 */
export const useCompleteLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CompleteLessonCommand) => {
            const response = await apiClient.post({
                url: '/CoursesProgress/CompleteLesson',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: progressKeys.byCourse(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.withLessons(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.stats(variables.courseId) });
        },
    });
};

/**
 * Завершение курса.
 */
export const useCompleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CompleteCourseCommand) => {
            const response = await apiClient.post({
                url: '/CoursesProgress/CompleteCourse',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: progressKeys.byCourse(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.withLessons(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.stats(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.user });
            queryClient.invalidateQueries({ queryKey: progressKeys.summary });
        },
    });
};

/**
 * Сброс прогресса по курсу.
 */
export const useResetCourseProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ResetCourseProgressCommand) => {
            const response = await apiClient.post({
                url: '/CoursesProgress/Reset',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: progressKeys.byCourse(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.withLessons(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.stats(variables.courseId) });
            queryClient.invalidateQueries({ queryKey: progressKeys.user });
        },
    });
};

/**
 * Прогресс пользователя по конкретному курсу.
 */
export const useCourseProgress = (courseId: string) => {
    return useQuery({
        queryKey: progressKeys.byCourse(courseId),
        queryFn: async () => {
            const response = await apiClient.get<CourseProgressResponse>({
                url: '/CoursesProgress/{courseId}',
                path: { courseId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!courseId,
    });
};

/**
 * Прогресс пользователя по курсу с детализацией по урокам.
 */
export const useCourseProgressWithLessons = (courseId: string) => {
    return useQuery({
        queryKey: progressKeys.withLessons(courseId),
        queryFn: async () => {
            const response = await apiClient.get<CourseProgressResponse>({
                url: '/CoursesProgress/{courseId}/WithLessons',
                path: { courseId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!courseId,
    });
};

/**
 * Статистика прогресса по курсу.
 */
export const useCourseProgressStats = (courseId: string) => {
    return useQuery({
        queryKey: progressKeys.stats(courseId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/CoursesProgress/{courseId}/Stats',
                path: { courseId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!courseId,
    });
};

/**
 * Список курсов пользователя с прогрессом (с пагинацией).
 */
export const useUserCourseProgress = (page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: [...progressKeys.user, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/CoursesProgress/User',
                body: { page, pageSize } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseProgressResponse;
        },
    });
};

/**
 * Сводная статистика прогресса текущего пользователя.
 */
export const useUserProgressSummary = () => {
    return useQuery({
        queryKey: progressKeys.summary,
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/CoursesProgress/User/Summary',
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
    });
};
