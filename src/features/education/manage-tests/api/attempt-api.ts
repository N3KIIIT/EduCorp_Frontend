'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import {
    AttemptResponse,
    AttemptBriefResponse,
    AttemptResultResponse,
    StartAttemptRequest,
    SubmitAnswerRequest,
    TestResponse,
    PagedRequest,
    PagedResponseOfAttemptBriefResponse,
} from '@/lib/api-client/types.gen';

const ATTEMPTS_QUERY_KEY = ['education', 'attempts'];

export type Attempt = AttemptResponse;
export type AttemptBrief = AttemptBriefResponse;

export const useStartAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: StartAttemptRequest) => {
            const response = await apiClient.post({
                url: '/Attempts/Start',
                body: request,
            });

            if (response.error) {
                throw response.error;
            }

            return response.data as string;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, 'active', variables.testId] });
        },
    });
};

export const useSubmitAnswer = () => {
    return useMutation({
        mutationFn: async (request: SubmitAnswerRequest) => {
            const response = await apiClient.post({
                url: '/Attempts/{attemptId}/SubmitAnswer',
                path: { attemptId: request.attemptId },
                body: request,
            });

            if (response.error) {
                throw response.error;
            }
        },
    });
};

export const useCompleteAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attemptId: string) => {
            const response = await apiClient.post({
                url: '/Attempts/{id}/Complete',
                path: { id: attemptId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, attemptId) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, attemptId] });
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
            if (!response.data) throw new Error('No data received');
            return response.data;
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
            if (!response.data) throw new Error('No data received');
            return response.data;
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
            if (!response.data) throw new Error('No data received');
            return response.data;
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
            if (!response.data) throw new Error('No data received');
            return response.data;
        },
        enabled: !!testId,
    });
};

export const useUpdateAnswer = () => {
    return useMutation({
        mutationFn: async ({ id, ...request }: SubmitAnswerRequest & { id: string }) => {
            const response = await apiClient.post({
                url: '/Attempts/{id}/UpdateAnswer',
                path: { id },
                body: request satisfies SubmitAnswerRequest,
            });

            if (response.error) {
                throw response.error;
            }
        },
    });
};

export const usePauseAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attemptId: string) => {
            const response = await apiClient.post({
                url: '/Attempts/{id}/Pause',
                path: { id: attemptId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, attemptId) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, attemptId] });
        },
    });
};

export const useResumeAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attemptId: string) => {
            const response = await apiClient.post({
                url: '/Attempts/{id}/Resume',
                path: { id: attemptId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, attemptId) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, attemptId] });
        },
    });
};

export const useReviewAttempt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (attemptId: string) => {
            const response = await apiClient.post({
                url: '/Attempts/{id}/Review',
                path: { id: attemptId },
            });

            if (response.error) {
                throw response.error;
            }
        },
        onSuccess: (_, attemptId) => {
            queryClient.invalidateQueries({ queryKey: [...ATTEMPTS_QUERY_KEY, attemptId] });
        },
    });
};

export const useAttemptResult = (attemptId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, attemptId, 'result'],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Attempts/GetAttemptResult/{id}',
                path: { id: attemptId },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as AttemptResultResponse;
        },
        enabled: !!attemptId,
    });
};

export const useAttemptsByTest = (testId: string, page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, 'byTest', testId, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Attempts/ByTest/{testId}',
                path: { testId },
                query: { page, pageSize },
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfAttemptBriefResponse;
        },
        enabled: !!testId,
    });
};

export const useAttemptsByUser = (userId: string, page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, 'byUser', userId, page, pageSize],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Attempts/ByUser/{userId}',
                path: { userId },
                body: { page, pageSize } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfAttemptBriefResponse;
        },
        enabled: !!userId,
    });
};

export const useBestAttempt = (testId: string, userId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, 'best', testId, userId],
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Attempts/Best/{testId}/{userId}',
                path: { testId, userId },
            });

            return response.data as AttemptBriefResponse | null;
        },
        enabled: !!testId && !!userId,
    });
};

export const useLastAttempt = (testId: string, userId: string) => {
    return useQuery({
        queryKey: [...ATTEMPTS_QUERY_KEY, 'last', testId, userId],
        queryFn: async () => {
            const response = await apiClient.get({
                url: '/Attempts/Last/{testId}/{userId}',
                path: { testId, userId },
            });

            return response.data as AttemptBriefResponse | null;
        },
        enabled: !!testId && !!userId,
        retry: false,
    });
};
