import {
    initData,
    miniApp,
    themeParams,
    viewport,
    retrieveLaunchParams,
    type LaunchParams
} from '@tma.js/sdk-react';


export const initializeTelegramSDK = (): LaunchParams | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const launchParams = retrieveLaunchParams();

        miniApp.mount();
        themeParams.mount();
        initData.restore();

        if (viewport.mount.isAvailable()) {
            viewport.mount();
            viewport.expand();
        }

        miniApp.ready();

        return launchParams;
    } catch (error) {
        console.error('Telegram SDK initialization error:', error);
        return null;
    }
};


export const isTelegramWebApp = (): boolean => {
    if (typeof window === 'undefined') return false;

    try {
        retrieveLaunchParams();
        return true;
    } catch {
        return false;
    }
};


export const getTelegramInitData = (): string | undefined => {
    try {
        if (!initData.restore) {
            return undefined;
        }
        return initData.raw();
    } catch {
        return undefined;
    }
};
