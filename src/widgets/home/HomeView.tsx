'use client';

import React from 'react';
import { View } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { HomeMainPanel } from "./panels/HomeMainPanel";
import { CourseDetailsPanel } from "@/features/education/manage-courses/ui/CourseDetailsPanel";
import { LessonDetailsPanel } from "@/features/education/manage-lessons/ui/LessonDetailsPanel";
import { TestDetailsPanel } from "@/features/education/manage-tests/ui/TestDetailsPanel";
import { TestTakePanel } from "@/features/education/manage-tests/ui/TestTakePanel";
import { COURSE_PANEL_IDS, LESSON_PANEL_IDS, TEST_PANEL_IDS } from "@/shared/config/navigation/panel-ids";
import { VIEW_IDS, HOME_PANEL_IDS } from '@/shared/config/navigation';


interface Props {
    id: string
}

export const HomeView: React.FC<Props> = ({ id }) => {
    const { activePanels, goBackPanel } = useNavigationStore();

    return (
        <View
            id={id}
            activePanel={activePanels[VIEW_IDS.HOME]}
            onSwipeBack={goBackPanel}
            history={[HOME_PANEL_IDS.MAIN]}>

            <HomeMainPanel id={HOME_PANEL_IDS.MAIN} />
            <CourseDetailsPanel id={COURSE_PANEL_IDS.DETAIL} />
            <LessonDetailsPanel id={LESSON_PANEL_IDS.DETAIL} />
            <TestDetailsPanel id={TEST_PANEL_IDS.DETAIL} />
            <TestTakePanel id={TEST_PANEL_IDS.TAKE} />
        </View>
    );
};

export default HomeView;