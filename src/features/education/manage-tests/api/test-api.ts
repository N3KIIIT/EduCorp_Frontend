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
    PagedResponseOfTestBriefResponse, PostApiTestsPublishedResponses,
} from '@/lib/api-client/types.gen';

const TESTS_QUERY_KEY = ['education', 'tests'];

// Type aliases for cleaner usage
export type Test = TestResponse;
export type TestBrief = TestBriefResponse;
export { TestType };

export const useTests = (courseId: string) => {
    return useQuery({
        queryKey: [...TESTS_QUERY_KEY, courseId],
        queryFn: async () => {
            const response = await apiClient.post<PostApiTestsPublishedResponses, PagedRequest>({
                url: 'Tests/ByCourse/{courseId}',
                path: { courseId },
                body: { page: 1, pageSize: 50 }
            });

            if (!response.data?.items) {
                throw new Error('No data received');
            }

            return response.data.items;
        },
        enabled: !!courseId
    });
};

export const useCreateTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: CreateTestRequest) => {
            const response = await apiClient.post<unknown, CreateTestRequest>({
                url: '/Tests',
                body: request
            });

            return response.data!;
        },
        onSuccess: (_, variables) => {
            if (variables.courseId) {
                queryClient.invalidateQueries({ queryKey: [...TESTS_QUERY_KEY, variables.courseId] });
            }
        }
    });
};

export const useUpdateTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateTestRequest & { id: string }) => {
            const response = await apiClient.put<unknown, UpdateTestRequest>({
                url: '/Tests/{id}',
                path: { id },
                body: request
            });

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TESTS_QUERY_KEY });
        }
    });
};

export const useDeleteTest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (testId: string) => {
            await apiClient.delete<void>({
                url: 'Tests/{id}',
                path: { id: testId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TESTS_QUERY_KEY });
        }
    });
};

export const useTest = (testId: string) => {
    return useQuery({
        queryKey: [...TESTS_QUERY_KEY, testId],
        queryFn: async () => {
            const response = await apiClient.get<TestResponse>({
                url: 'Tests/{id}',
                path: { id: testId }
            });

            return response.data!;
        },
        enabled: !!testId
    });
};
