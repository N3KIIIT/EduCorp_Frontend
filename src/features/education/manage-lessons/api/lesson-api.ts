'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    AddLessonRequest,
    UpdateLessonRequest,
    LessonType, PostApiLessonsByCourseByCourseIdResponses,
    GetApiLessonsByIdResponses
} from '@/lib/api-client/types.gen';

const LESSONS_QUERY_KEY = ['education', 'lessons'];

export { LessonType };

export const useLessons = (courseId: string) => {
    return useQuery({
        queryKey: [...LESSONS_QUERY_KEY, courseId],
        queryFn: async () => {
            const response = await apiClient.post<PostApiLessonsByCourseByCourseIdResponses>({
                url: `Lessons/ByCourse/${courseId}`,
                body: { 
                    page: 1,
                    pageSize: 50
                }
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data.items!;
        },
        enabled: !!courseId
    });
};

export const useCreateLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddLessonRequest) => {
            const response = await apiClient.post<AddLessonRequest>({
                url: '/Lessons',
                body: request
            });

            return response.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...LESSONS_QUERY_KEY, variables.courseId] });
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

            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY });
        }
    });
};

export const useDeleteLesson = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (lessonId: string) => {
            await apiClient.delete<void>({
                url: '/Lessons/{id}',
                path: { id: lessonId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LESSONS_QUERY_KEY });
        }
    });
};

export const useLesson = (lessonId: string) => {
    return useQuery({
        queryKey: [...LESSONS_QUERY_KEY, lessonId],
        queryFn: async () => {
            const response = await apiClient.get<GetApiLessonsByIdResponses>({
                url: `/Lessons/${lessonId}`
            });

            return response.data!;
        },
        enabled: !!lessonId
    });
};
