'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { backButton } from '@tma.js/sdk-react';
import { useNavigationStore } from '@/shared/lib/navigation/store'

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                            children
                                                                        }) => {
    const pathname = usePathname();
    const { goBackPanel, panelHistory, activeView } = useNavigationStore();

    useEffect(() => {
        if (!backButton) return;

        const history = panelHistory[activeView];
        const canGoBack = history && history.length > 1;

        if (canGoBack) {
            backButton.show();
        } else {
            backButton.hide();
        }

        const handleBackClick = () => {
            const didGoBack = goBackPanel();
            if (!didGoBack) {
            }
        };

        backButton.onClick(handleBackClick);

        return () => {
            backButton.offClick(handleBackClick);
        };
    }, [backButton, goBackPanel, panelHistory, activeView, pathname]);

    return <>{children}</>;
};
