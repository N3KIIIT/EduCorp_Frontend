'use client';

import { useLaunchParams as useTmaInitData } from '@tma.js/sdk-react';


export const useInitData = () => {
    const initData = useTmaInitData().tgWebAppData;

    return {
        initData: initData ?? null,
        initDataRaw: initData?.initDataRaw ?? null,
        user: initData?.user
            ? {
                id: initData.user.id,
                firstName: initData.user.firstName,
                lastName: initData.user.lastName,
                username: initData.user.username,
                languageCode: initData.user.languageCode,
                isPremium: initData.user.isPremium,
                photoUrl: initData.user.photoUrl,
            }
            : null,
        startParam: initData?.startParam ?? null,
        chatType: initData?.chatType ?? null,
        chatInstance: initData?.chatInstance ?? null,
    };
};
