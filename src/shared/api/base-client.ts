import { client } from '@/lib/api-client/client.gen';
import { useSessionStore } from '@/entities/session';
import { API_CONFIG } from '@/shared/config/api';
import { refreshAccessToken, clearPersistedTokens } from '@/entities/session/lib/token-service';

let initialized = false;

export function initApiClient(): void {
    if (initialized) return;
    initialized = true;

    client.setConfig({
        baseUrl: API_CONFIG.BASE_URL,
    });

    client.interceptors.request.use((request) => {
        const accessToken = useSessionStore.getState().accessToken;

        if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`);
        }

        return request;
    });

    client.interceptors.response.use(async (response, request) => {
        if (response.status === 401) {
            const result = await refreshAccessToken();

            if (result) {
                const newRequest = new Request(request, {
                    headers: new Headers(request.headers),
                });
                newRequest.headers.set('Authorization', `Bearer ${result.token}`);
                return fetch(newRequest);
            }

            useSessionStore.getState().clearSession();
            clearPersistedTokens();
        }
        return response;
    });
}

export { client as apiClient };

