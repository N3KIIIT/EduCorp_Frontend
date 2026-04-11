'use client';

import React from 'react';
import { View } from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { HomeMainPanel } from "./panels/HomeMainPanel";
import { CourseDetailsPanel } from "@/features/education/manage-courses/ui/CourseDetailsPanel";
import { LessonDetailsPanel } from "@/features/education/manage-lessons/ui/LessonDetailsPanel";
import { TestDetailsPanel } from "@/features/education/manage-tests/ui/TestDetailsPanel";
import { TestTakePanel } from "@/features/education/manage-tests/ui/TestTakePanel";
import { AttemptsHistoryPanel } from "@/features/education/manage-tests/ui/AttemptsHistoryPanel";
import { AttemptReviewPanel } from "@/features/education/manage-tests/ui/AttemptReviewPanel";
import { NewsPostDetailPanel } from "@/features/news/ui/NewsPostDetailPanel";
import { PassScanPanel } from "@/features/passes/ui/PassScanPanel";
import { AdminPassListPanel } from "@/features/passes/ui/AdminPassListPanel";
import {
    COURSE_PANEL_IDS,
    LESSON_PANEL_IDS,
    TEST_PANEL_IDS,
    NEWS_PANEL_IDS,
    PASS_PANEL_IDS,
} from "@/shared/config/navigation/panel-ids";
import { VIEW_IDS, HOME_PANEL_IDS } from '@/shared/config/navigation';


interface Props {
    id: string;
}

export const HomeView: React.FC<Props> = ({ id }) => {
    const { activePanels, goBackPanel } = useNavigationStore();

    return (
        <View
            id={id}
            activePanel={activePanels[VIEW_IDS.HOME]}
            onSwipeBack={goBackPanel}
            history={[HOME_PANEL_IDS.MAIN]}
        >
            <HomeMainPanel id={HOME_PANEL_IDS.MAIN} />

            {/* Education */}
            <CourseDetailsPanel id={COURSE_PANEL_IDS.DETAIL} />
            <LessonDetailsPanel id={LESSON_PANEL_IDS.DETAIL} />
            <TestDetailsPanel id={TEST_PANEL_IDS.DETAIL} />
            <TestTakePanel id={TEST_PANEL_IDS.TAKE} />
            <AttemptsHistoryPanel id={TEST_PANEL_IDS.ATTEMPTS} />
            <AttemptReviewPanel id={TEST_PANEL_IDS.ATTEMPT_REVIEW} />

            {/* News */}
            <NewsPostDetailPanel id={NEWS_PANEL_IDS.DETAIL} />

            {/* Passes */}
            <PassScanPanel id={PASS_PANEL_IDS.SCAN} />
            <AdminPassListPanel id={PASS_PANEL_IDS.ADMIN_LIST} />
        </View>
    );
};

export default HomeView;
