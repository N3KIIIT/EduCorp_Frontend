'use client';

import React, { useState } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Button,
    Div,
    ModalRoot,
    Spinner,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { NEWS_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import {
    useNewsPost,
    usePublishNewsPost,
    useUnpublishNewsPost,
    useArchiveNewsPost,
    usePinNewsPost,
    useUnpinNewsPost,
} from '../api/news-api';
import { NewsCreateEditModal } from './NewsCreateEditModal';
import '@/features/news/news.css';

const RUSSIAN_MONTHS = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = RUSSIAN_MONTHS[date.getMonth()];
    return `${day} ${month}`;
}

interface NewsPostDetailPanelProps {
    id: string;
}

export const NewsPostDetailPanel: React.FC<NewsPostDetailPanelProps> = ({ id }) => {
    const t = useTranslations('news');
    const { goBackPanel, activeModal, openModal, closeModal } = useNavigationStore();
    const { currentNewsPostId } = useAppContextStore();

    const [showEditModal, setShowEditModal] = useState(false);

    const postQuery = useNewsPost(currentNewsPostId ?? '');
    const publishPost = usePublishNewsPost();
    const unpublishPost = useUnpublishNewsPost();
    const archivePost = useArchiveNewsPost();
    const pinPost = usePinNewsPost();
    const unpinPost = useUnpinNewsPost();

    const post = postQuery.data;

    const displayDate = formatDate(post?.publishedAt ?? post?.createdAt ?? null);

    const handleEditOpen = () => {
        setShowEditModal(true);
        openModal(NEWS_MODAL_IDS.CREATE);
    };

    const handleModalClose = () => {
        setShowEditModal(false);
        closeModal();
    };

    const handlePublish = () => {
        if (currentNewsPostId) publishPost.mutate(currentNewsPostId);
    };

    const handleUnpublish = () => {
        if (currentNewsPostId) unpublishPost.mutate(currentNewsPostId);
    };

    const handleArchive = () => {
        if (currentNewsPostId) archivePost.mutate(currentNewsPostId);
    };

    const handlePin = () => {
        if (currentNewsPostId) pinPost.mutate(currentNewsPostId);
    };

    const handleUnpin = () => {
        if (currentNewsPostId) unpinPost.mutate(currentNewsPostId);
    };

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={handleModalClose}>
            <NewsCreateEditModal
                mode="edit"
                postId={currentNewsPostId ?? undefined}
                onClose={handleModalClose}
                onSuccess={handleModalClose}
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
                        <Button size="s" mode="tertiary" onClick={handleEditOpen}>
                            {t('edit')}
                        </Button>
                    </PermissionGuard>
                }
            >
                {post?.title ?? t('loading')}
            </PanelHeader>

            {postQuery.isLoading && (
                <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <Spinner size="m" />
                </Div>
            )}

            {post && (
                <>
                    {post.imageUrl && (
                        <img
                            className="newsDetailImage"
                            src={post.imageUrl}
                            alt={post.title}
                        />
                    )}

                    <div className="newsDetailMeta">
                        {post.category && (
                            <span className="newsCategory">{post.category.name}</span>
                        )}
                        {displayDate && (
                            <span className="newsDetailAuthor">{displayDate}</span>
                        )}
                        {post.authorName && (
                            <span className="newsDetailAuthor">{post.authorName}</span>
                        )}
                        {post.isPinned && (
                            <span className="newsPinBadge">📌</span>
                        )}
                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <span className={
                                post.status === 'Published' ? 'newsStatusPublished'
                                    : post.status === 'Draft' ? 'newsStatusDraft'
                                        : 'newsStatusArchived'
                            }>
                                {post.status === 'Published' ? 'Опубликовано'
                                    : post.status === 'Draft' ? 'Черновик'
                                        : 'Архив'}
                            </span>
                        </PermissionGuard>
                    </div>

                    <div
                        className="newsDetailContent"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        <Div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {post.status === 'Draft' && (
                                <Button
                                    size="s"
                                    mode="primary"
                                    loading={publishPost.isPending}
                                    onClick={handlePublish}
                                >
                                    {t('publish')}
                                </Button>
                            )}
                            {post.status === 'Published' && (
                                <Button
                                    size="s"
                                    mode="secondary"
                                    loading={unpublishPost.isPending}
                                    onClick={handleUnpublish}
                                >
                                    {t('unpublish')}
                                </Button>
                            )}
                            {post.status !== 'Archived' && (
                                <Button
                                    size="s"
                                    mode="secondary"
                                    loading={archivePost.isPending}
                                    onClick={handleArchive}
                                >
                                    {t('archive')}
                                </Button>
                            )}
                            {post.isPinned ? (
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    loading={unpinPost.isPending}
                                    onClick={handleUnpin}
                                >
                                    {t('unpin')}
                                </Button>
                            ) : (
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    loading={pinPost.isPending}
                                    onClick={handlePin}
                                >
                                    {t('pin')}
                                </Button>
                            )}
                        </Div>
                    </PermissionGuard>
                </>
            )}
        </Panel>
    );
};
