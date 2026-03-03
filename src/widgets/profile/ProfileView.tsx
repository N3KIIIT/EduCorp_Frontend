'use client';

import React from 'react';
import { View } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { VIEW_IDS, PROFILE_PANEL_IDS } from '@/shared/config/navigation';
import { ProfileMainPanel } from './panels/ProfileMainPanel';
import { ProfileEditPanel } from './panels/ProfileEditPanel';
import { ProfileSettingsPanel } from './panels/ProfileSettingsPanel';

type Props = { id: string };

export const ProfileView: React.FC<Props> = ({id}) => {
    const { activePanels, goBackPanel } = useNavigationStore();

    return (
        <View
            id={id}
            activePanel={activePanels[VIEW_IDS.PROFILE]}
            onSwipeBack={goBackPanel}
            history={[PROFILE_PANEL_IDS.MAIN]}>
            
            <ProfileMainPanel id={PROFILE_PANEL_IDS.MAIN} />
            <ProfileEditPanel id={PROFILE_PANEL_IDS.EDIT} />
            <ProfileSettingsPanel id={PROFILE_PANEL_IDS.SETTINGS} />
            
        </View>
    );
};

export default ProfileView;