'use client';

import { useEffect, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSessionStore } from '@/entities/session/model/store';
import { userMapper } from '@/entities/user/lib/mappers';
import { apiClient } from '@/shared/api/base-client';
import { getTelegramInitData } from '@/shared/lib/telegram/init';
import { persistTokens, persistUserData, tryRestoreSession } from '@/entities/session/lib/token-service';
import type { AuthenticationResponse, LoginByTelegramRequest, PostApiAuthLoginByTelegramResponses } from '@/lib/api-client/types.gen';

interface UseAutoLoginResult {
    isLoading: boolean;
    isAuthenticated: boolean;
    error: Error | null;
    retry: () => void;
}


async function loginWithTelegram(initData: string) {
    const requestDto: LoginByTelegramRequest = { initData };
    const response = await apiClient.post<PostApiAuthLoginByTelegramResponses>({
        url: '/Auth/LoginByTelegram',
        body: requestDto
    });

    if (!response.data || typeof response.data !== 'object') {
        throw new Error('No data received');
    }

    const authData = response.data as AuthenticationResponse;
    if (!authData.user || !authData.token) {
        throw new Error('Invalid auth response');
    }

    return authData;
}

export const useAutoLogin = (): UseAutoLoginResult => {
    const { isAuthenticated, setSession, clearSession } = useSessionStore();
    const [isRestoring, setIsRestoring] = useState(true);

    const mutation = useMutation({
        mutationFn: loginWithTelegram,
        onSuccess: (data) => {
            const user = userMapper.toDomain(data.user);
            setSession(user, data.token, data.refreshToken);
            persistTokens(data.token, data.refreshToken);
            persistUserData(JSON.stringify(data.user));
        },
        onError: () => {
            clearSession();
        },
    });

    const performLogin = useCallback(() => {
        if (mutation.isPending) return;

        const initData = getTelegramInitData();
        if (!initData) {
            mutation.reset();
            return;
        }

        mutation.mutate(initData);
    }, [mutation]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        tryRestoreSession()
            .then((restored) => {
                if (!restored) {
                    performLogin();
                }
            })
            .finally(() => {
                setIsRestoring(false);
            });
    }, []);

    return {
        isLoading: isRestoring || mutation.isPending,
        isAuthenticated,
        error: mutation.error,
        retry: performLogin,
    };
};

