'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    QuestionResponse,
    QuestionBriefResponse,
    AddQuestionRequest,
    UpdateQuestionRequest,
    IQuestionDataRequest,
    QuestionDataType,
    PagedResponseOfQuestionBriefResponse,
    ReorderQuestionsRequest,
    SearchQuestionsQuery,
} from '@/lib/api-client/types.gen';

const QUESTIONS_QUERY_KEY = ['education', 'questions'];

const questionKeys = {
    all: QUESTIONS_QUERY_KEY,
    byTest: (testId: string) => [...QUESTIONS_QUERY_KEY, 'byTest', testId] as const,
    detail: (questionId: string) => [...QUESTIONS_QUERY_KEY, 'detail', questionId] as const,
};

// Type aliases for cleaner usage
export type Question = QuestionResponse;
export type QuestionBrief = QuestionBriefResponse;
export type { IQuestionDataRequest as QuestionDataRequest };
export { QuestionDataType };

export const useQuestions = (testId: string) => {
    return useQuery({
        queryKey: questionKeys.byTest(testId),
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Questions/ByTest/{testId}',
                path: { testId },
                query: { page: 1, pageSize: 50 },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return (response.data as PagedResponseOfQuestionBriefResponse).items ?? [];
        },
        enabled: !!testId,
    });
};

export const useCreateQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddQuestionRequest) => {
            const response = await apiClient.post({
                url: '/Questions',
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: questionKeys.byTest(variables.testId) });
        }
    });
};

export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateQuestionRequest & { id: string }) => {
            const response = await apiClient.put({
                url: '/Questions/{id}',
                path: { id },
                body: request
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: questionKeys.detail(variables.id) });
        }
    });
};

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (questionId: string) => {
            const response = await apiClient.delete<void>({
                url: '/Questions/{id}',
                path: { id: questionId }
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, questionId) => {
            queryClient.invalidateQueries({ queryKey: questionKeys.detail(questionId) });
            queryClient.invalidateQueries({ queryKey: questionKeys.all });
        }
    });
};

export const useQuestion = (questionId: string) => {
    return useQuery({
        queryKey: questionKeys.detail(questionId),
        queryFn: async () => {
            const response = await apiClient.get<QuestionResponse>({
                url: '/Questions/{id}',
                path: { id: questionId }
            });

            if (!response.data) throw new Error('No data received');
            return response.data;
        },
        enabled: !!questionId,
    });
};

export const useReorderQuestions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ testId, ...request }: ReorderQuestionsRequest & { testId: string }) => {
            const response = await apiClient.post({
                url: '/Questions/Reorder/{testId}',
                path: { testId },
                body: request satisfies ReorderQuestionsRequest,
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: questionKeys.byTest(variables.testId) });
        },
    });
};

export const useSearchQuestions = (query: SearchQuestionsQuery, enabled = true) => {
    return useQuery({
        queryKey: [...QUESTIONS_QUERY_KEY, 'search', query],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Questions/Search',
                body: query,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfQuestionBriefResponse;
        },
        enabled,
    });
};
