'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    CourseResponse,
    CreateCourseRequest,
    UpdateCourseRequest,
    SearchCoursesQuery,
    PagedRequest,
    PagedResponseOfCourseBriefResponse,
    GetApiCoursesByIdWithLessonsResponses,
    PostApiCoursesSearchResponses,
} from '@/lib/api-client/types.gen';

const COURSES_QUERY_KEY = ['education', 'courses'];

export const courseKeys = {
    all: COURSES_QUERY_KEY,
    byTenant: (tenantId: string) => [...COURSES_QUERY_KEY, 'byTenant', tenantId] as const,
    detail: (courseId: string) => [...COURSES_QUERY_KEY, 'detail', courseId] as const,
};

export const useCourses = (tenantId?: string) => {
    return useQuery({
        queryKey: tenantId ? courseKeys.byTenant(tenantId) : courseKeys.all,
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Courses/ByTenant',
                body: { page: 1, pageSize: 50 } satisfies PagedRequest,
            });

            if (response.error) {
                console.error('[useCourses] API error:', response.error);
                const msg = typeof response.error === 'object'
                    ? JSON.stringify(response.error)
                    : String(response.error);
                throw new Error(msg);
            }

            if (!response.data) {
                console.error('[useCourses] No data received, full response:', response);
                throw new Error('No data received from /Courses/ByTenant');
            }

            console.log('[useCourses] Success:', response.data);
            return (response.data as PagedResponseOfCourseBriefResponse).items ?? [];
        },
        retry: 1,
    });
};

export const useCreateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateCourseRequest) => {
            const response = await apiClient.post({
                url: '/Courses',
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        }
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateCourseRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/Courses/{id}',
                path: { id },
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        }
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const response = await apiClient.delete<void>({
                url: '/Courses/{id}',
                path: { id: courseId }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        }
    });
};

export const useCourse = (courseId: string) => {
    return useQuery({
        queryKey: courseKeys.detail(courseId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/{id}',
                path: { id: courseId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as CourseResponse;
        },
        enabled: !!courseId,
    });
};

export const useCourseWithLessons = (courseId: string) => {
    return useQuery({
        queryKey: [...courseKeys.detail(courseId), 'withLessons'],
        queryFn: async () => {
            const response = await apiClient.get<GetApiCoursesByIdWithLessonsResponses>({
                url: '/Courses/{id}/WithLessons',
                path: { id: courseId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
        enabled: !!courseId,
    });
};

export const usePublishCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const response = await apiClient.post({
                url: '/Courses/{id}/Publish',
                path: { id: courseId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        },
    });
};

export const useArchiveCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const response = await apiClient.post({
                url: '/Courses/{id}/Archive',
                path: { id: courseId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        },
    });
};

export const useUnpublishCourse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            const response = await apiClient.post({
                url: '/Courses/{id}/Unpublish',
                path: { id: courseId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, courseId) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
            queryClient.invalidateQueries({ queryKey: courseKeys.all });
        },
    });
};

export const useCourseSearch = (query: SearchCoursesQuery, enabled = true) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'search', query],
        queryFn: async () => {
            const response = await apiClient.post<PostApiCoursesSearchResponses>({
                url: '/Courses/Search',
                body: query,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
        enabled,
    });
};

export const useCoursesByAuthor = (authorId: string, page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'byAuthor', authorId, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/ByAuthor/{authorId}',
                path: { authorId },
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
        enabled: !!authorId,
    });
};

export const useCoursesByCategory = (categoryId: string, page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'byCategory', categoryId, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/ByCategory/{categoryId}',
                path: { categoryId },
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
        enabled: !!categoryId,
    });
};

export const useCoursesByTag = (tag: string, page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'byTag', tag, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/ByTag/{tag}',
                path: { tag },
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
        enabled: !!tag,
    });
};

export const usePublicCourses = (page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'public', page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/Public',
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
    });
};

export const usePublishedCourses = (page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...COURSES_QUERY_KEY, 'published', page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Courses/Published',
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfCourseBriefResponse;
        },
    });
};
