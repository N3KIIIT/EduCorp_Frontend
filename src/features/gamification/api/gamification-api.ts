'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/base-client';
import type {
    GamificationProfileResponse,
    PagedRequest,
    PagedResponseOfLeaderboardEntryResponse,
} from '@/lib/api-client/types.gen';

const GAMIFICATION_QUERY_KEY = ['gamification'];

const gamificationKeys = {
    all: GAMIFICATION_QUERY_KEY,
    profile: [...GAMIFICATION_QUERY_KEY, 'profile'] as const,
    leaderboard: (page: number, pageSize: number) =>
        [...GAMIFICATION_QUERY_KEY, 'leaderboard', page, pageSize] as const,
};

/**
 * Геймификационный профиль текущего пользователя (очки, уровень, достижения).
 */
export const useGamificationProfile = () => {
    return useQuery({
        queryKey: gamificationKeys.profile,
        queryFn: async () => {
            const response = await apiClient.get<GamificationProfileResponse>({
                url: '/Gamification/Profile',
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data;
        },
    });
};

/**
 * Таблица лидеров (с пагинацией).
 */
export const useLeaderboard = (page = 1, pageSize = 20) => {
    return useQuery({
        queryKey: gamificationKeys.leaderboard(page, pageSize),
        queryFn: async () => {
            const response = await apiClient.post({
                url: '/Gamification/Leaderboard',
                body: { page, pageSize } satisfies PagedRequest,
            });

            if (!response.data) {
                throw new Error('No data received');
            }

            return response.data as PagedResponseOfLeaderboardEntryResponse;
        },
    });
};
