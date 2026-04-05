'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    TestResponse,
    TestBriefResponse,
    CreateTestRequest,
    UpdateTestRequest,
    TestType,
    PagedRequest,
    PagedResponseOfTestBriefResponse,
} from '@/lib/api-client/types.gen';

const TESTS_QUERY_KEY = ['education', 'tests'];

const testKeys = {
    all: TESTS_QUERY_KEY,
    byCourse: (courseId: string) => [...TESTS_QUERY_KEY, 'byCourse', courseId] as const,
    detail: (testId: string) => [...TESTS_QUERY_KEY, 'detail', testId] as const,
};

// Type aliases for cleaner usage
export type Test = TestResponse;
export type TestBrief = TestBriefResponse;
export { TestType };

export const useTests = (courseId: string) => {
    return useQuery({
        queryKey: testKeys.byCourse(courseId),
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Tests/ByCourse/{courseId}',
                path: { courseId },
                body: { page: 1, pageSize: 50 } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfTestBriefResponse).items ?? [];
        },
        enabled: !!courseId,
    });
};

export const useCreateTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateTestRequest) => {
            const response = await apiClient.post({
                url: '/Tests',
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            if (variables.courseId) {
                queryClient.invalidateQueries({ queryKey: testKeys.byCourse(variables.courseId) });
            }
        }
    });
};

export const useUpdateTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateTestRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/Tests/{id}',
                path: { id },
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: testKeys.detail(variables.id) });
        }
    });
};

export const useDeleteTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (testId: string) => {
            const response = await apiClient.delete<void>({
                url: '/Tests/{id}',
                path: { id: testId }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, testId) => {
            queryClient.invalidateQueries({ queryKey: testKeys.detail(testId) });
            queryClient.invalidateQueries({ queryKey: testKeys.all });
        }
    });
};

export const useTest = (testId: string) => {
    return useQuery({
        queryKey: testKeys.detail(testId),
        queryFn: async () => {
            const response = await apiClient.get<TestResponse>({
                url: '/Tests/{id}',
                path: { id: testId }
            });

            if (!response.data) throw new Error('No data received');
            return response.data;
        },
        enabled: !!testId,
    });
};

export const useTestsByLesson = (lessonId: string) => {
    return useQuery({
        queryKey: [...TESTS_QUERY_KEY, 'byLesson', lessonId],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Tests/ByLesson/{lessonId}',
                path: { lessonId },
                body: { page: 1, pageSize: 50 } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfTestBriefResponse).items ?? [];
        },
        enabled: !!lessonId,
    });
};

export const usePublishedTests = (page = 1, pageSize = 50) => {
    return useQuery({
        queryKey: [...TESTS_QUERY_KEY, 'published', page, pageSize],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Tests/Published',
                body: { page, pageSize } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfTestBriefResponse;
        },
    });
};

export const useArchiveTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (testId: string) => {
            const response = await apiClient.post({
                url: '/Tests/{id}/Archive',
                path: { id: testId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, testId) => {
            queryClient.invalidateQueries({ queryKey: testKeys.detail(testId) });
            queryClient.invalidateQueries({ queryKey: testKeys.all });
        },
    });
};
