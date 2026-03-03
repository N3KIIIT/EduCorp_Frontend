'use client';

import { initData  } from '@tma.js/sdk-react';
import { useMemo } from 'react';


export const useTelegramUser = (ssr = true)  => {

    const user = useMemo(() => {
        if (!initData?.user()) return null;

        return {
            id: initData.user()?.id,
            first_name: initData.user()?.first_name,
            last_name: initData.user()?.last_name,
            username: initData.user()?.username,
            language_code: initData.user()?.language_code,
            is_premium: initData.user()?.is_premium,
            photo_url: initData.user()?.photo_url,
        };
    }, [initData]);

    return user;
};
