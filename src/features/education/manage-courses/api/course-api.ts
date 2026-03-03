'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    CourseResponse,
    CourseBriefResponse,
    CreateCourseRequest,
    UpdateCourseRequest,
    PagedRequest,
    PagedResponseOfCourseBriefResponse, PostApiCoursesSearchResponses, GetApiCoursesByIdResponses,
} from '@/lib/api-client/types.gen';

const COURSES_QUERY_KEY = ['education', 'courses'];

export const useCourses = (tenantId: string) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, tenantId],
        queryFn: async () => {
            const response = await apiClient.post<PostApiCoursesSearchResponses>({
                url: `/Courses/ByTenant`,
                body: { page: 1, pageSize: 50 }
            });

            if (!response.data?.items) {
                throw new Error('No data received');
            }

            return response.data.items;
        },
        enabled: !!tenantId
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateCourseRequest) => {
            const response = await apiClient.post<CourseResponse, CreateCourseRequest>({
                url: '/Courses',
                body: request
            });

            return response.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
        }
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateCourseRequest & { id: string }) => {
            const response = await apiClient.put<unknown, UpdateCourseRequest>({
                url: '/Courses/{id}',
                path: { id },
                body: request
            });

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
        }
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            await apiClient.delete<void>({
                url: '/Courses/{id}',
                path: { id: courseId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
        }
    });
};

export const useCourse = (courseId: string) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, courseId],
        queryFn: async () => {
            const response = await apiClient.get<GetApiCoursesByIdResponses>({
                url: `/Courses/${courseId}`
            });

            return response.data!;
        },
        enabled: !!courseId
    });
};
