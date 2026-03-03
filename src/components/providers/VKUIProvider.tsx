'use client';

import React from 'react';
import { AdaptivityProvider, AppRoot, ConfigProvider, } from '@vkontakte/vkui';
import { useTheme } from '@/core/theme/ThemeContext';
import { miniApp, useSignal } from "@tma.js/sdk-react";

interface VKUIProviderProps {
    children: React.ReactNode;
}

/**
 * Provider для VKUI с интеграцией Telegram темы
 */
export const VKUIProvider: React.FC<VKUIProviderProps> = ({ children }) => {
    const { shouldRender } = useTheme();

    if (!shouldRender) return <div className="root__loading">Loading Theme...</div>;

    const { resolvedTheme } = useTheme();

    return (
        <ConfigProvider
            colorScheme={resolvedTheme}
            isWebView={true}
        >
            <AdaptivityProvider>
                <AppRoot>
                    {children}
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
};
