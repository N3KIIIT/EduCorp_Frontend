'use client';

import React, { useEffect } from 'react';
import { Alert, Box, Button, Spinner } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useAutoLogin } from '../model/useAutoLogin';
import { useHapticFeedback } from '@/shared/lib/telegram/hooks/useHapticFeedback';

interface AutoLoginProviderProps {
    children: React.ReactNode;
}


export const AutoLoginProvider: React.FC<AutoLoginProviderProps> = ({
    children
}) => {
    const { isLoading, isAuthenticated, error, retry } = useAutoLogin();
    const { notifyError } = useHapticFeedback();
    const t = useTranslations();

    useEffect(() => {
        if (error) {
            notifyError();
        }
    }, [error, notifyError]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
                <Spinner size="l" />
            </div>
        );
    }

    if (error) {
        return (
            <Box className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
                <Alert
                    onClose={retry}
                    title={t('auth.error.title')}
                    className="mb-4"
                >
                    {error.message}
                </Alert>

                <Button
                    size="l"
                    onClick={retry}
                >
                    {t('auth.retry')}
                </Button>
            </Box>
        );
    }

    return (<>{children}</>);
};
