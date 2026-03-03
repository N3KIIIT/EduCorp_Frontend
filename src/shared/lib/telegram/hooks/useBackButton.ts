'use client';

import { backButton  } from '@tma.js/sdk-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseBackButtonOptions {
    show?: boolean;
    onClick?: () => void;
}


export const useBackButton = (options: UseBackButtonOptions = {}) => {
    const { show = false, onClick } = options;
    const router = useRouter();

    useEffect(() => {
        if (!backButton) return;

        const handleClick = () => {
            if (onClick) {
                onClick();
            } else {
                router.back();
            }
        };

        backButton.onClick(handleClick);

        if (show) {
            backButton.show();
        } else {
            backButton.hide();
        }

        return () => {
            backButton.offClick(handleClick);
            backButton.hide();
        };
    }, [backButton, show, onClick, router]);

    return backButton;
};
