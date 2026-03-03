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
    ChoiceOptionRequest,
    PagedRequest,
    PagedResponseOfQuestionBriefResponse, PostApiQuestionsByTestByTestIdResponses,
} from '@/lib/api-client/types.gen';

const QUESTIONS_QUERY_KEY = ['education', 'questions'];

// Type aliases for cleaner usage
export type Question = QuestionResponse;
export type QuestionBrief = QuestionBriefResponse;
export type { IQuestionDataRequest as QuestionDataRequest };
export { QuestionDataType };

export const useQuestions = (testId: string) => {
    return useQuery({
        queryKey: [...QUESTIONS_QUERY_KEY, testId],
        queryFn: async () => {
            const response = await apiClient.post<PostApiQuestionsByTestByTestIdResponses, PagedRequest>({
                url: '/Questions/ByTest/{testId}',
                path: { testId },
                body: { page: 1, pageSize: 50 }
            });

            if (!response.data?.items) {
                throw new Error('No data received');
            }

            return response.data.items;
        },
        enabled: !!testId
    });
};

export const useCreateQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: AddQuestionRequest) => {
            const response = await apiClient.post<unknown, AddQuestionRequest>({
                url: '/Questions',
                body: request
            });

            return response.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...QUESTIONS_QUERY_KEY, variables.testId] });
        }
    });
};

export const useUpdateQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...request }: UpdateQuestionRequest & { id: string }) => {
            const response = await apiClient.put<unknown, UpdateQuestionRequest>({
                url: '/Questions/{id}',
                path: { id },
                body: request
            });

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
        }
    });
};

export const useDeleteQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (questionId: string) => {
            await apiClient.delete<void>({
                url: '/Questions/{id}',
                path: { id: questionId }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
        }
    });
};

export const useQuestion = (questionId: string) => {
    return useQuery({
        queryKey: [...QUESTIONS_QUERY_KEY, questionId],
        queryFn: async () => {
            const response = await apiClient.get<QuestionResponse>({
                url: '/Questions/{id}',
                path: { id: questionId }
            });

            return response.data!;
        },
        enabled: !!questionId
    });
};
