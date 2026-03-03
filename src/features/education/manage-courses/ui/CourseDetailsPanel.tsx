'use client';

import React, { useState } from 'react';
import { Button, Group, ModalRoot, Panel, PanelHeader, PanelHeaderBack, Title, Tabs, TabsItem } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useCourse } from '../api/course-api';
import { LessonList } from "@/features/education/manage-lessons/ui/LessonList";
import { LessonCreateModal } from "@/features/education/manage-lessons/ui/LessonCreateModal";
import { TestCreateModal } from "@/features/education/manage-tests/ui/TestCreateModal";
import { TestList } from "@/features/education/manage-tests/ui/TestList";
import { Icon24Add } from "@vkontakte/icons";
import { LESSON_MODAL_IDS, TEST_MODAL_IDS } from "@/shared/config/navigation/modal-ids";
import { useAppContextStore } from "@/shared/lib/navigation/appContextStore";
import { PermissionGuard } from "@/features/education/ui/PermissionGuard";
import { ROLES } from "@/entities/session";
import {LESSON_PANEL_IDS, TEST_PANEL_IDS} from "@/shared/config/navigation/panel-ids";

interface CourseDetailsPanelProps {
    id: string;
}

export const CourseDetailsPanel: React.FC<CourseDetailsPanelProps> = ({ id }) => {
    const t = useTranslations('education.courses');
    const { goBackPanel, activeModal, closeModal, openModal, goToPanel } = useNavigationStore();
    const { currentCourseId, setCurrentLessonId, setCurrentTestId } = useAppContextStore();
    const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');
    
    const handleLessonSelect = (lessonId: string) => {
        setCurrentLessonId(lessonId);
        goToPanel(LESSON_PANEL_IDS.DETAIL);
        console.log('Selected lesson:', lessonId);
    };

    const handleTestSelect = (testId: string) => {
        setCurrentTestId(testId);
        goToPanel(TEST_PANEL_IDS.DETAIL);
        console.log('Selected test:', testId);
    };

    const courseQuery = useCourse(currentCourseId || '');

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            <LessonCreateModal
                courseId={currentCourseId!}
                onClose={() => {
                    closeModal();
                }}
            />
            <TestCreateModal
                courseId={currentCourseId!}
                onClose={() => {
                    closeModal();
                }}
            />
        </ModalRoot>
    );
    
    return (
        <Panel id={id}>
            {modalRoot}
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
                after={
                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        {activeTab === 'lessons' ? (
                            <Button
                                size="s"
                                mode="primary"
                                before={<Icon24Add />}
                                onClick={() => openModal(LESSON_MODAL_IDS.CREATE)}
                            >
                                {t('addLesson')}
                            </Button>
                        ) : (
                            <Button
                                size="s"
                                mode="primary"
                                before={<Icon24Add />}
                                onClick={() => openModal(TEST_MODAL_IDS.CREATE)}
                            >
                                {t('addTest')}
                            </Button>
                        )}
                    </PermissionGuard>
                }
            >
                {courseQuery.data?.title || t('details')}
            </PanelHeader>
            {modalRoot}
            <Group>
                {courseQuery.isLoading && <Title level="2">{t('loading')}</Title>}
                {courseQuery.error && <Title level="2">{t('errorLoading')}</Title>}
                {courseQuery.data && (
                    <>
                        <Title level="2">{courseQuery.data.title}</Title>
                        {courseQuery.data.description && (
                            <div style={{ marginTop: 12 }}>
                                {courseQuery.data.description}
                            </div>
                        )}

                        <Group>
                            <Tabs>
                                <TabsItem
                                    selected={activeTab === 'lessons'}
                                    onClick={() => setActiveTab('lessons')}
                                >
                                    {t('lessonsTab')}
                                </TabsItem>
                                <TabsItem
                                    selected={activeTab === 'tests'}
                                    onClick={() => setActiveTab('tests')}
                                >
                                    {t('testsTab')}
                                </TabsItem>
                            </Tabs>
                        </Group>

                        {activeTab === 'lessons' && (
                            <LessonList
                                courseId={currentCourseId!}
                                onEditLesson={(lessonId) => {
                                    console.log('Edit lesson:', lessonId);
                                    setCurrentLessonId(lessonId);
                                    openModal(LESSON_MODAL_IDS.EDIT);
                                }}
                                onSelectLesson={handleLessonSelect}
                            />
                        )}

                        {activeTab === 'tests' && (
                            <TestList
                                courseId={currentCourseId!}
                                onSelectTest={handleTestSelect}
                            />
                        )}
                    </>
                )}
            </Group>
        </Panel>
    );
};
