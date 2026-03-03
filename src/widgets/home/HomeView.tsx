'use client';

import React from 'react';
import { View } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import {VIEW_IDS, HOME_PANEL_IDS} from '@/shared/config/navigation';
import {HomeMainPanel} from "./panels/HomeMainPanel";


interface Props { 
    id: string 
}

export const HomeView: React.FC<Props> = ({id}) => {
    const { activePanels, goBackPanel } = useNavigationStore();

    return (
        <View
            id={id}
            activePanel={activePanels[VIEW_IDS.HOME]}
            onSwipeBack={goBackPanel}
            history={[HOME_PANEL_IDS.MAIN]}>
            
            <HomeMainPanel id={HOME_PANEL_IDS.MAIN} />
        </View>
    );
};

export default HomeView;