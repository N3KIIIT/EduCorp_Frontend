'use client';

import { hapticFeedback as useTelegramHaptic} from '@tma.js/sdk-react';
import { useCallback } from 'react';


export const useHapticFeedback = (ssr = true) => {
    const haptic = useTelegramHaptic;

    const impactLight = useCallback(() => {
        haptic?.impactOccurred('light');
    }, [haptic]);

    const impactMedium = useCallback(() => {
        haptic?.impactOccurred('medium');
    }, [haptic]);

    const impactHeavy = useCallback(() => {
        haptic?.impactOccurred('heavy');
    }, [haptic]);

    const notifySuccess = useCallback(() => {
        haptic?.notificationOccurred('success');
    }, [haptic]);

    const notifyError = useCallback(() => {
        haptic?.notificationOccurred('error');
    }, [haptic]);

    const notifyWarning = useCallback(() => {
        haptic?.notificationOccurred('warning');
    }, [haptic]);

    const selectionChanged = useCallback(() => {
        haptic?.selectionChanged();
    }, [haptic]);

    return {
        impactLight,
        impactMedium,
        impactHeavy,
        notifySuccess,
        notifyError,
        notifyWarning,
        selectionChanged,
    };
};
