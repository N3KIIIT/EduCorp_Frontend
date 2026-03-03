'use client';

import React from 'react';
import {Panel, PanelHeader, PanelHeaderBack, Group, Button, ModalRoot} from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useNavigationStore} from '@/shared/lib/navigation/store';
import {useLesson} from "@/features/education/manage-lessons/api/lesson-api";
import {useAppContextStore} from "@/shared/lib/navigation/appContextStore";
import {ContentBlockList} from "@/features/education/manage-content-blocks/ui/ContentBlockList";
import {PermissionGuard} from '@/features/education/ui/PermissionGuard';
import {ROLES} from "@/entities/session";
import {ContentBlockCreateModal} from "@/features/education/manage-content-blocks/ui/ContentBlockCreateModal";
import {CONTENT_BLOCK_MODAL_IDS} from "@/shared/config/navigation/modal-ids";


interface LessonDetailsPanelProps {
    id: string;
}

export const LessonDetailsPanel: React.FC<LessonDetailsPanelProps> = ({id}) => {
    const t = useTranslations('education.contentBlocks');
    const {goBackPanel, activeModal, closeModal, openModal} = useNavigationStore();
    const { currentLessonId } = useAppContextStore();
    const {data, isLoading} = useLesson(currentLessonId!);

    const modalRoot = (
        <ModalRoot activeModal={activeModal}
                   onClose={closeModal}>
            <ContentBlockCreateModal
                lessonId={currentLessonId!}
                onClose={() => {
                    closeModal();
                }}
                onSuccess={closeModal}
            />
        </ModalRoot>
    );
    
    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>        
                {data?.title || t('details')}
            </PanelHeader>
            {modalRoot}
            <Group>
                <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                    <Button
                        size="l"
                        stretched
                        onClick={() => openModal(CONTENT_BLOCK_MODAL_IDS.CREATE)}
                    >
                        {t('createContentBlock')}
                    </Button>
                </PermissionGuard>
                <ContentBlockList lessonId={currentLessonId!} />
            </Group>
        </Panel>
    );
};
