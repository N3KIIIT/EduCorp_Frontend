'use client';

import { mainButton } from '@tma.js/sdk-react';
import { useEffect } from 'react';

interface UseMainButtonOptions {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    progress?: boolean;
    color?: string;
    textColor?: string;
}


export const useMainButton = (options: UseMainButtonOptions) => {
    const {
        text,
        onClick,
        disabled = false,
        progress = false,
        color,
        textColor,
    } = options;
    
    useEffect(() => {
        if (!mainButton) return;

        mainButton.setText(text);

        if (color) {
        }

        if (textColor) {
        }

        if (progress) {
        } else {
            mainButton.hide();
        }

        mainButton.onClick(onClick);
        mainButton.show();

        return () => {
            mainButton.offClick(onClick);
            mainButton.hide();
        };
    }, [mainButton, text, onClick, disabled, progress, color, textColor]);

    return mainButton;
};
