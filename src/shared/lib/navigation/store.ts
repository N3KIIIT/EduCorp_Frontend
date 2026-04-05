'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    VIEW_IDS,
    DEFAULT_PANELS,
    type ViewId,
    type PanelId
} from '@/shared/config/navigation';

interface NavigationState {
    activeView: ViewId;
    activePanels: Record<ViewId, PanelId>;
    activeModal: string | null;
    panelHistory: Record<ViewId, PanelId[]>;
}

interface NavigationStore extends NavigationState {
    setActiveView: (view: ViewId) => void;

    setActivePanel: (view: ViewId, panel: PanelId) => void;
    goToPanel: (panel: PanelId) => void;
    goBackPanel: () => boolean;

    openModal: (modalId: string) => void;
    closeModal: () => void;

    clearHistory: (view: ViewId) => void;
}


export const useNavigationStore = create<NavigationStore>()(
    devtools(
        (set, get) => ({
            activeView: VIEW_IDS.HOME,
            activePanels: DEFAULT_PANELS,
            activeModal: null,
            panelHistory: {
                [VIEW_IDS.HOME]: [DEFAULT_PANELS[VIEW_IDS.HOME]],
                [VIEW_IDS.SEARCH]: [DEFAULT_PANELS[VIEW_IDS.SEARCH]],
                [VIEW_IDS.PROFILE]: [DEFAULT_PANELS[VIEW_IDS.PROFILE]],
                [VIEW_IDS.ADMIN]: [DEFAULT_PANELS[VIEW_IDS.ADMIN]],
            },

            setActiveView: (view) => {
                set({ activeView: view });
            },

            setActivePanel: (view, panel) => {
                set((state) => {
                    const newActivePanels = { ...state.activePanels };
                    newActivePanels[view] = panel;

                    const newHistory = { ...state.panelHistory };
                    const viewHistory = [...newHistory[view]];

                    if (viewHistory[viewHistory.length - 1] !== panel) {
                        viewHistory.push(panel);
                    }

                    newHistory[view] = viewHistory;

                    return {
                        activePanels: newActivePanels,
                        panelHistory: newHistory,
                    };
                });
            },

            goToPanel: (panel) => {
                const { activeView } = get();
                get().setActivePanel(activeView, panel);
            },

            goBackPanel: () => {
                const { activeView, panelHistory } = get();
                const history = panelHistory[activeView];

                if (history.length <= 1) {
                    return false;
                }

                set((state) => {
                    const newHistory = { ...state.panelHistory };
                    const viewHistory = [...newHistory[activeView]];

                    viewHistory.pop();

                    const previousPanel = viewHistory[viewHistory.length - 1] as PanelId;
                    newHistory[activeView] = viewHistory;

                    const newActivePanels = { ...state.activePanels };
                    newActivePanels[activeView] = previousPanel;

                    return {
                        activePanels: newActivePanels,
                        panelHistory: newHistory,
                    };
                });

                return true;
            },

            openModal: (modalId) => {
                set({ activeModal: modalId });
            },

            closeModal: () => {
                set({ activeModal: null });
            },

            clearHistory: (view) => {
                set((state) => {
                    const newHistory = { ...state.panelHistory };
                    newHistory[view] = [DEFAULT_PANELS[view]];

                    const newActivePanels = { ...state.activePanels };
                    newActivePanels[view] = DEFAULT_PANELS[view];

                    return {
                        panelHistory: newHistory,
                        activePanels: newActivePanels,
                    };
                });
            },
        }),
        { name: 'NavigationStore' }
    )
);
