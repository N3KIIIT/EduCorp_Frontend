'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    AttemptResponse,
    AttemptBriefResponse,
    StartAttemptRequest,
    SubmitAnswerRequest,
    IAnswerDataRequest,
    TestResponse,
    QuestionResponse,
    PagedRequest,
    PagedResponseOfAttemptBriefResponse, PostApiAttemptsStartData, PostApiAttemptsStartResponses,
} from '@/lib/api-client/types.gen';

const ATTEMPTS_QUERY_KEY = ['education', 'attempts'];

export type Attempt = AttemptResponse;
export type AttemptBrief = AttemptBriefResponse;

export const useStartAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: StartAttemptRequest) => {
            const response = await apiClient.post<PostApiAttemptsStartResponses>({
                url: '/Attempts/Start',
                body: request,
            });
            return response.data!;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, variables.testId] });
        },
    });
};

export const useSubmitAnswer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: SubmitAnswerRequest) => {
            const response = await apiClient.post<unknown, SubmitAnswerRequest>({
                url: '/Attempts/{attemptId}/SubmitAnswer',
                path: { attemptId: request.attemptId },
                body: request,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [...ATTEMPTS_QUERY_KEY, variables.attemptId],
            });
        },
    });
};

export const useCompleteAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attemptId: string) => {
            const response = await apiClient.post<AttemptResponse, undefined>({
                url: '/Attempts/{id}/Complete',
                path: { id: attemptId },
                body: undefined,
            });
            return response.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ATTEMPTS_QUERY_KEY });
        },
    });
};

export const useAttempt = (attemptId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, attemptId],
        queryFn: async () => {
            const response = await apiClient.get<AttemptResponse>({
                url: '/Attempts/{id}',
                path: { id: attemptId },
            });
            return response.data!;
        },
        enabled: !!attemptId,
    });
};

export const useAttemptWithAnswers = (attemptId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, attemptId, 'answers'],
        queryFn: async () => {
            const response = await apiClient.get<AttemptResponse>({
                url: '/Attempts/{id}/WithAnswers',
                path: { id: attemptId },
            });
            return response.data!;
        },
        enabled: !!attemptId,
    });
};

export const useAttemptResults = (attemptId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, attemptId, 'results'],
        queryFn: async () => {
            const response = await apiClient.get<AttemptResponse>({
                url: '/Attempts/{id}/Results',
                path: { id: attemptId },
            });
            return response.data!;
        },
        enabled: !!attemptId,
    });
};

export const useActiveAttempt = (testId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, 'active', testId],
        queryFn: async () => {
            const response = await apiClient.get<AttemptResponse>({
                url: '/Attempts/Active/{testId}',
                path: { testId },
            });
            return response.data ?? null;
        },
        enabled: !!testId,
        retry: false,
    });
};

export const useTestWithQuestions = (testId: string) => {
    return useQuery({
        queryKey: ['education', 'tests', testId, 'questions'],
        queryFn: async () => {
            const response = await apiClient.get<TestResponse>({
                url: '/Tests/{id}/WithQuestions',
                path: { id: testId },
            });
            return response.data!;
        },
        enabled: !!testId,
    });
};
