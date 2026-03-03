'use client';

import React, {useMemo, useState} from 'react';
import {Button, Caption, Chip, Group, Header, ModalRoot, Panel, Tabs, TabsItem,} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useSessionStore} from '@/entities/session/model/store';
import {CourseList} from '@/features/education/manage-courses/ui/CourseList';
import {CourseCreateModal} from '@/features/education/manage-courses/ui/CourseCreateModal';
import type {LessonBriefResponse} from '@/lib/api-client/types.gen';
import {useNavigationStore} from "@/shared/lib/navigation/store";
import {COURSE_PANEL_IDS} from "@/shared/config/navigation/panel-ids";
import {PermissionGuard} from "@/features/education/ui/PermissionGuard";
import {Icon24Add} from "@vkontakte/icons";
import {COURSE_MODAL_IDS, LESSON_MODAL_IDS} from "@/shared/config/navigation/modal-ids";
import {HOME_VIEW_TAB_IDS} from "@/shared/config/navigation/tabs-ids";
import {useAppContextStore} from "@/shared/lib/navigation/appContextStore";
import {CourseEditModal} from "@/features/education/manage-courses/ui/CourseEditModal";

interface CourseDetailsPanelProps {
    id: string;
}

export const CoursesNewsTabs: React.FC<CourseDetailsPanelProps> = ({id}) => {
    const t = useTranslations('home.tabs');
    const {tenantId, hasAnyRole} = useSessionStore();
    const {goToPanel, activeModal, openModal, closeModal} = useNavigationStore();
    const {setCurrentCourseId, currentCourseId} = useAppContextStore();

    const [activeTab, setActiveTab] = useState<string>(HOME_VIEW_TAB_IDS.COURSE);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const handleCourseCreated = () => {
        // Refresh is handled by query invalidation
    };

    const modalRoot = (
        <ModalRoot activeModal={activeModal}
                   onClose={closeModal}>
            <CourseCreateModal
                onClose={() => {
                    closeModal();
                }}
                onSuccess={handleCourseCreated}
            />

            <CourseEditModal
                courseId={currentCourseId!}
                onClose={() =>
                    closeModal
                }
                onSuccess={closeModal}
            />
        </ModalRoot>
    );

    const handleLessonSelect = (lesson: LessonBriefResponse) => {
        // Navigate to lesson content view or show lesson details
        console.log('Selected lesson:', lesson);
    };


    const handleLessonCreated = () => {
        // Refresh is handled by query invalidation
    };

    const tabsContent = useMemo(() => {
        if (activeTab === HOME_VIEW_TAB_IDS.COURSE) {
            return (
                <>
                    <Group mode="plain">
                        <Header
                            subtitle={t('coursesSubtitle')}
                            after={
                                // <PermissionGuard roles={['ADMIN', 'MANAGER']}>
                                <Button
                                    size="s"
                                    mode="primary"
                                    before={<Icon24Add/>}
                                    onClick={() => openModal(COURSE_MODAL_IDS.CREATE)}
                                >
                                    {t('addLesson')}
                                </Button>
                                // </PermissionGuard>
                            }>
                            {t('coursesTitle')}
                        </Header>
                    </Group>
                    <Group>
                        <CourseList
                            tenantId={tenantId}
                            onEditCourse={(courseId) => {
                                setCurrentCourseId(courseId);
                                openModal(COURSE_MODAL_IDS.EDIT)
                            }}
                            onViewCourse={
                                (courseId) => {
                                    setCurrentCourseId(courseId);
                                    goToPanel(COURSE_PANEL_IDS.DETAIL);
                                }}
                        />
                    </Group>
                </>
            );
        }

        return (
            <>
                <Group mode="plain">
                    <Header
                        subtitle={t('lessonsSubtitle')}
                        after={
                            <PermissionGuard roles={['ADMIN', 'MANAGER']}>
                                <Button
                                    size="s"
                                    mode="primary"
                                    before={<Icon24Add/>}
                                    onClick={() => openModal(LESSON_MODAL_IDS.CREATE)}
                                >
                                    {t('addLesson')}
                                </Button>
                            </PermissionGuard>
                        }
                    >
                        {t('lessonsTitle')}
                    </Header>
                    <Caption>
                        {t('forCourse')}: {selectedCourseId}
                    </Caption>
                </Group>
            </>
        );
    }, [activeTab, tenantId, selectedCourseId, t, hasAnyRole]);

    return (
        <Panel id={id}>
            {modalRoot}
            <Tabs mode="default" layoutFillMode="stretched">
                <TabsItem id={HOME_VIEW_TAB_IDS.COURSE}
                          selected={activeTab === HOME_VIEW_TAB_IDS.COURSE}
                          onClick={() => setActiveTab(HOME_VIEW_TAB_IDS.COURSE)}>
                    {t('coursesTab')}
                </TabsItem>
                <TabsItem id={HOME_VIEW_TAB_IDS.NEWS}
                          selected={activeTab === HOME_VIEW_TAB_IDS.NEWS}
                          onClick={() => setActiveTab(HOME_VIEW_TAB_IDS.NEWS)}>
                    {t('newsTab')}
                    {selectedCourseId && (
                        <Chip
                            style={{marginLeft: 8}}
                        >
                            #{selectedCourseId.slice(0, 6)}
                        </Chip>
                    )}
                </TabsItem>
            </Tabs>

            {tabsContent}
        </Panel>
    );
};
