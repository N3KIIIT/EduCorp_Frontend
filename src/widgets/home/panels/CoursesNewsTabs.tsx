'use client';

import React, { useMemo, useState } from 'react';
import { Button, Group, Header, ModalRoot, Tabs, TabsItem } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { CourseList } from '@/features/education/manage-courses/ui/CourseList';
import { CourseCreateModal } from '@/features/education/manage-courses/ui/CourseCreateModal';
import { CourseEditModal } from '@/features/education/manage-courses/ui/CourseEditModal';
import { NewsPanel } from '@/features/news/ui/NewsPanel';
import { NewsCreateEditModal } from '@/features/news/ui/NewsCreateEditModal';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { COURSE_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { Icon24Add } from '@vkontakte/icons';
import { COURSE_MODAL_IDS, NEWS_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import { ROLES } from '@/entities/session';
import { HOME_VIEW_TAB_IDS } from '@/shared/config/navigation/tabs-ids';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { useSessionStore } from '@/entities/session/model/store';

export const CoursesNewsTabs: React.FC = () => {
    const t = useTranslations('home.tabs');
    const { tenantId } = useSessionStore();
    const { goToPanel, activeModal, openModal, closeModal } = useNavigationStore();
    const { setCurrentCourseId, currentCourseId } = useAppContextStore();

    const [activeTab, setActiveTab] = useState<string>(HOME_VIEW_TAB_IDS.COURSE);
    const [editNewsPostId, setEditNewsPostId] = useState<string | undefined>(undefined);

    // Single ModalRoot for ALL modals in this section
    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            {/* Course modals */}
            <CourseCreateModal onClose={closeModal} onSuccess={closeModal} />
            <CourseEditModal courseId={currentCourseId!} onClose={closeModal} onSuccess={closeModal} />
            {/* News modals */}
            <NewsCreateEditModal
                mode={editNewsPostId ? 'edit' : 'create'}
                postId={editNewsPostId}
                onClose={closeModal}
                onSuccess={closeModal}
            />
        </ModalRoot>
    );

    const tabsContent = useMemo(() => {
        if (activeTab === HOME_VIEW_TAB_IDS.COURSE) {
            return (
                <>
                    <Group mode="plain">
                        <Header
                            subtitle={t('coursesSubtitle')}
                            after={
                                <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                                    <Button
                                        size="s"
                                        mode="primary"
                                        before={<Icon24Add />}
                                        onClick={() => openModal(COURSE_MODAL_IDS.CREATE)}
                                    >
                                        {t('addCourse')}
                                    </Button>
                                </PermissionGuard>
                            }
                        >
                            {t('coursesTitle')}
                        </Header>
                    </Group>
                    <Group>
                        <CourseList
                            tenantId={tenantId}
                            onEditCourse={(courseId) => {
                                setCurrentCourseId(courseId);
                                openModal(COURSE_MODAL_IDS.EDIT);
                            }}
                            onViewCourse={(courseId) => {
                                setCurrentCourseId(courseId);
                                goToPanel(COURSE_PANEL_IDS.DETAIL);
                            }}
                        />
                    </Group>
                </>
            );
        }

        // News tab — no ModalRoot here, modals handled above
        return (
            <NewsPanel
                onCreatePost={() => {
                    setEditNewsPostId(undefined);
                    openModal(NEWS_MODAL_IDS.CREATE);
                }}
                onEditPost={(postId) => {
                    setEditNewsPostId(postId);
                    openModal(NEWS_MODAL_IDS.CREATE);
                }}
            />
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, tenantId, t]);

    return (
        <>
            {modalRoot}

            <Tabs mode="default" layoutFillMode="stretched">
                <TabsItem
                    id={HOME_VIEW_TAB_IDS.COURSE}
                    selected={activeTab === HOME_VIEW_TAB_IDS.COURSE}
                    onClick={() => setActiveTab(HOME_VIEW_TAB_IDS.COURSE)}
                >
                    {t('coursesTab')}
                </TabsItem>
                <TabsItem
                    id={HOME_VIEW_TAB_IDS.NEWS}
                    selected={activeTab === HOME_VIEW_TAB_IDS.NEWS}
                    onClick={() => setActiveTab(HOME_VIEW_TAB_IDS.NEWS)}
                >
                    {t('newsTab')}
                </TabsItem>
            </Tabs>

            {tabsContent}
        </>
    );
};
