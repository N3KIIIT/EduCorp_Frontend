'use client';

import React from 'react';
import { Box, Placeholder, Spinner } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';

interface LoadingStateProps {
    /** 'panel' renders a centered spinner with padding (for full-panel loading) */
    variant?: 'panel' | 'placeholder';
}

/**
 * Unified loading component.
 * Use variant="panel" inside a Panel before content is ready.
 * Use variant="placeholder" (default) inside a Group/List.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ variant = 'placeholder' }) => {
    const t = useTranslations('common');

    if (variant === 'panel') {
        return (
            <Box style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size="m" />
            </Box>
        );
    }

    return <Placeholder>{t('loading')}</Placeholder>;
};
