'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSignal, miniApp } from '@tma.js/sdk-react';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    resolvedTheme: 'light' | 'dark';
    shouldRender: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeType>('system');
    const [mounted, setMounted] = useState(false);
    const isDarkSystem = useSignal(miniApp.isDark);

    useEffect(() => {
        const stored = localStorage.getItem('app-theme') as ThemeType;
        if (stored) {
            setTheme(stored);
        }
        setMounted(true);
    }, []);

    const handleSetTheme = (newTheme: ThemeType) => {
        setTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
    };

    const resolvedTheme = theme === 'system'
        ? (isDarkSystem ? 'dark' : 'light')
        : theme;

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme, shouldRender: mounted }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
