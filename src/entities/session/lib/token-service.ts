'use client';

import { useSessionStore } from '@/entities/session/model/store';
import { SESSION_CONSTANTS } from '@/entities/session/model/constants';
import { userMapper } from '@/entities/user/lib/mappers';
import { API_CONFIG } from '@/shared/config/api';
import type { AuthenticationResponse, RefreshTokenRequest } from '@/lib/api-client/types.gen';


const { STORAGE_KEYS } = SESSION_CONSTANTS;

let refreshPromise: Promise<AuthenticationResponse | null> | null = null;


export function persistTokens(accessToken: string, refreshToken: string): void {
    try {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch {
    }
}

export function clearPersistedTokens(): void {
    try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch {
    }
}

export function getPersistedRefreshToken(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
        return null;
    }
}

export function persistUserData(userData: string): void {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
    } catch {
    }
}

async function callRefreshEndpoint(refreshToken: string): Promise<AuthenticationResponse> {
    const body: RefreshTokenRequest = { refreshToken };

    const response = await fetch(`${API_CONFIG.BASE_URL}/Auth/Refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
    }

    const data: AuthenticationResponse = await response.json();

    if (!data.token || !data.refreshToken || !data.user) {
        throw new Error('Invalid refresh response');
    }

    return data;
}

export async function refreshAccessToken(): Promise<AuthenticationResponse | null> {
    if (refreshPromise) {
        return refreshPromise;
    }

    const storedRefreshToken =
        useSessionStore.getState().refreshToken ?? getPersistedRefreshToken();

    if (!storedRefreshToken) {
        return null;
    }

    refreshPromise = callRefreshEndpoint(storedRefreshToken)
        .then((data) => {
            const user = userMapper.toDomain(data.user);
            const store = useSessionStore.getState();
            // Use tenantId from refresh response; fall back to store value if not present
            const tenantId = data.tenantId || store.tenantId;

            store.setSession(user, data.token, data.refreshToken, tenantId);
            persistTokens(data.token, data.refreshToken);
            persistUserData(JSON.stringify(data.user));

            return data;
        })
        .catch(() => {
            useSessionStore.getState().clearSession();
            clearPersistedTokens();
            return null;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
}


export async function tryRestoreSession(): Promise<boolean> {
    const storedRefreshToken = getPersistedRefreshToken();
    if (!storedRefreshToken) {
        return false;
    }

    const result = await refreshAccessToken();
    return result !== null;
}
