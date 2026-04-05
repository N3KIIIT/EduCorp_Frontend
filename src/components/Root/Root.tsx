'use client';

import { type PropsWithChildren, useEffect, useState } from 'react';
import { initData, useSignal, } from '@tma.js/sdk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { setLocale } from '@/core/i18n/locale';

import './styles.css';
import '@vkontakte/vkui/dist/vkui.css';

import AuthGuard from "@/entities/session/lib/auth-guard";
import { AutoLoginProvider } from "@/features/auth/auto-login/ui/AutoLoginProvider";
import { VKUIProvider } from "@/components/providers/VKUIProvider";
import { RouterProvider } from "@/components/providers/RouterProvider";
import { ThemeProvider } from '@/core/theme/ThemeContext';
import { initApiClient } from '@/shared/api/base-client';

// Initialize once at module load — no side-effects inside the module itself
initApiClient();

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: 1,
                retryDelay: 1000,
                refetchOnWindowFocus: false,
                staleTime: 30_000,
            },
            mutations: {
                retry: 0,
            }
        }
    });
}


function RootInner({ children }: PropsWithChildren) {
    const initDataUser = useSignal(initData.user);
    const [queryClient] = useState(() => makeQueryClient());

    useEffect(() => {
        if (initDataUser) {
            // Check if user has already set a preference
            const hasLocaleCookie = document.cookie.split(';').some((item) => item.trim().startsWith('NEXT_LOCALE='));
            if (!hasLocaleCookie) {
                setLocale(initDataUser.language_code);
            }
        }
    }, [initDataUser]);


    return (
        <ThemeProvider>
            <VKUIProvider>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider>
                        <AutoLoginProvider>
                            <AuthGuard>
                                <TonConnectUIProvider manifestUrl="/tonconnect-manifest.json">
                                    {children}
                                </TonConnectUIProvider>
                            </AuthGuard>
                        </AutoLoginProvider>
                    </RouterProvider>
                </QueryClientProvider>
            </VKUIProvider>
        </ThemeProvider>
    )
}

export function Root(props: PropsWithChildren) {
    const didMount = useDidMount();

    return didMount ? (
        <ErrorBoundary fallback={ErrorPage}>
            <RootInner {...props} />
        </ErrorBoundary>
    ) : (
        <div className="root__loading">Loading</div>
    );
}
