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
import '@/features/education/education.css';

interface LessonDetailsPanelProps {
    id: string;
}

function getCoverVariant(title: string): number {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 8;
}

function getLessonTypeEmoji(lessonType: string): string {
    switch (lessonType?.toLowerCase()) {
        case 'video': return '🎬';
        case 'text': case 'article': return '📄';
        case 'quiz': case 'test': return '📝';
        case 'practice': return '💪';
        case 'interactive': return '🎮';
        default: return '📖';
    }
}

export const LessonDetailsPanel: React.FC<LessonDetailsPanelProps> = ({id}) => {
    const t = useTranslations('education.contentBlocks');
    const tLessons = useTranslations('education.lessons');
    const {goBackPanel, activeModal, closeModal, openModal} = useNavigationStore();
    const { currentLessonId } = useAppContextStore();
    const {data, isLoading} = useLesson(currentLessonId!);

    const variant = data ? getCoverVariant(data.title) : 0;
    const emoji = data ? getLessonTypeEmoji(data.lessonType) : '📖';

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={closeModal}>
            <ContentBlockCreateModal
                lessonId={currentLessonId!}
                onClose={closeModal}
                onSuccess={closeModal}
            />
        </ModalRoot>
    );

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />} transparent>
                {data?.title || t('details')}
            </PanelHeader>
            {modalRoot}

            {!isLoading && data && (
                <div className={`heroHero heroHero--${variant}`}>
                    <div className="heroTitle">{data.title}</div>
                    <div className="heroMeta">
                        <span className="heroBadge">
                            {emoji} {tLessons(`lessonType.${data.lessonType}`)}
                        </span>
                        {data.estimatedDurationMinutes && (
                            <span className="heroBadge">
                                {data.estimatedDurationMinutes} {tLessons('minutes')}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <Group style={{ marginTop: 8 }}>
                <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                    <Button
                        size="l"
                        stretched
                        onClick={() => openModal(CONTENT_BLOCK_MODAL_IDS.CREATE)}
                        style={{ margin: '8px 16px' }}
                    >
                        {t('createContentBlock')}
                    </Button>
                </PermissionGuard>
                <ContentBlockList lessonId={currentLessonId!} />
            </Group>
        </Panel>
    );
};
