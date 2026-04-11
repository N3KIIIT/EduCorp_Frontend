'use client';

import React, { useState } from 'react';
import { Button, Group, ModalRoot, Panel, PanelHeader, PanelHeaderBack, Spinner, Tabs, TabsItem } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useCourse } from '../api/course-api';
import { LessonList } from '@/features/education/manage-lessons/ui/LessonList';
import { LessonCreateModal } from '@/features/education/manage-lessons/ui/LessonCreateModal';
import { TestCreateModal } from '@/features/education/manage-tests/ui/TestCreateModal';
import { TestList } from '@/features/education/manage-tests/ui/TestList';
import { Icon24Add } from '@vkontakte/icons';
import { LESSON_MODAL_IDS, TEST_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { LESSON_PANEL_IDS, TEST_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import '@/features/education/education.css';

interface CourseDetailsPanelProps {
    id: string;
}

function getCoverVariant(title: string): number {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 8;
}

export const CourseDetailsPanel: React.FC<CourseDetailsPanelProps> = ({ id }) => {
    const t = useTranslations('education.courses');
    const { goBackPanel, activeModal, closeModal, openModal, goToPanel } = useNavigationStore();
    const { currentCourseId, setCurrentLessonId, setCurrentTestId } = useAppContextStore();
    const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons');

    const handleLessonSelect = (lessonId: string) => {
        setCurrentLessonId(lessonId);
        goToPanel(LESSON_PANEL_IDS.DETAIL);
    };

    const handleTestSelect = (testId: string) => {
        setCurrentTestId(testId);
        goToPanel(TEST_PANEL_IDS.DETAIL);
    };

    const courseQuery = useCourse(currentCourseId || '');
    const course = courseQuery.data;
    const variant = course ? getCoverVariant(course.title) : 0;

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            <LessonCreateModal courseId={currentCourseId!} onClose={closeModal} />
            <TestCreateModal courseId={currentCourseId!} onClose={closeModal} />
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
                            <Button size="s" mode="primary" before={<Icon24Add />} onClick={() => openModal(LESSON_MODAL_IDS.CREATE)}>
                                {t('addLesson')}
                            </Button>
                        ) : (
                            <Button size="s" mode="primary" before={<Icon24Add />} onClick={() => openModal(TEST_MODAL_IDS.CREATE)}>
                                {t('addTest')}
                            </Button>
                        )}
                    </PermissionGuard>
                }
                transparent
            >
                {course?.title || t('details')}
            </PanelHeader>

            {courseQuery.isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Spinner size="l" />
                </div>
            )}

            {course && (
                <>
                    {/* Hero banner */}
                    <div className={`heroHero heroHero--${variant}`}>
                        <div className="heroTitle">{course.title}</div>
                        <div className="heroMeta">
                            <span className="heroBadge">
                                {course.isPublic ? t('public') : t('private')}
                            </span>
                            {course.lessons?.length > 0 && (
                                <span className="heroBadge">
                                    {course.lessons.length} {t('lessonsTab').toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {course.description && (
                        <div style={{ padding: '12px 16px 0' }}>
                            <div className="descriptionBlock">{course.description}</div>
                        </div>
                    )}

                    {/* Tabs */}
                    <Group style={{ marginTop: 12 }}>
                        <Tabs>
                            <TabsItem selected={activeTab === 'lessons'} onClick={() => setActiveTab('lessons')}>
                                {t('lessonsTab')}
                            </TabsItem>
                            <TabsItem selected={activeTab === 'tests'} onClick={() => setActiveTab('tests')}>
                                {t('testsTab')}
                            </TabsItem>
                        </Tabs>
                    </Group>

                    {activeTab === 'lessons' && (
                        <LessonList
                            courseId={currentCourseId!}
                            onEditLesson={(lessonId) => {
                                setCurrentLessonId(lessonId);
                                openModal(LESSON_MODAL_IDS.EDIT);
                            }}
                            onSelectLesson={handleLessonSelect}
                        />
                    )}

                    {activeTab === 'tests' && (
                        <TestList courseId={currentCourseId!} onSelectTest={handleTestSelect} />
                    )}
                </>
            )}
        </Panel>
    );
};
