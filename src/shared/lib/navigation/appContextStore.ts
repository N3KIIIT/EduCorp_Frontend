'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppContextState {
    currentTenantId: string | null;
    currentCourseId: string | null;
    currentLessonId: string | null;
    currentTestId: string | null;
    currentAttemptId: string | null;
    currentNewsPostId: string | null;
    currentPassId: string | null;
}

interface AppContextActions {
    setCurrentTenantId: (id: string | null) => void;
    setCurrentCourseId: (id: string | null) => void;
    setCurrentLessonId: (id: string | null) => void;
    setCurrentTestId: (id: string | null) => void;
    setCurrentAttemptId: (id: string | null) => void;
    setCurrentNewsPostId: (id: string | null) => void;
    setCurrentPassId: (id: string | null) => void;
    resetContext: () => void;
}

export type AppContextStore = AppContextState & AppContextActions;

export const useAppContextStore = create<AppContextStore>()(
    devtools(
        (set) => ({
            currentTenantId: null,
            currentCourseId: null,
            currentLessonId: null,
            currentTestId: null,
            currentAttemptId: null,
            currentNewsPostId: null,
            currentPassId: null,

            setCurrentTenantId: (id) => set({ currentTenantId: id }),
            setCurrentCourseId: (id) => set({ currentCourseId: id }),
            setCurrentLessonId: (id) => set({ currentLessonId: id }),
            setCurrentTestId: (id) => set({ currentTestId: id }),
            setCurrentAttemptId: (id) => set({ currentAttemptId: id }),
            setCurrentNewsPostId: (id) => set({ currentNewsPostId: id }),
            setCurrentPassId: (id) => set({ currentPassId: id }),

            resetContext: () =>
                set({
                    currentTenantId: null,
                    currentCourseId: null,
                    currentLessonId: null,
                    currentTestId: null,
                    currentAttemptId: null,
                    currentNewsPostId: null,
                    currentPassId: null,
                }),
        }),
        { name: 'AppContextStore' }
    )
);