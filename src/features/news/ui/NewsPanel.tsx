'use client';

import React, { useState } from 'react';
import { Button, Div } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { useSessionStore } from '@/entities/session';
import { NEWS_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import { useNewsPosts, useNewsCategories } from '../api/news-api';
import { NewsPostCard } from './NewsPostCard';
import '@/features/news/news.css';

function NewsSkeletonCard() {
    return (
        <div className="newsSkeletonCard">
            <div className="newsSkeletonImage" />
            <div className="newsSkeletonBody">
                <div className="newsSkeletonLine" style={{ width: '80%' }} />
                <div className="newsSkeletonLine" style={{ width: '60%' }} />
                <div className="newsSkeletonLine" style={{ width: '40%' }} />
            </div>
        </div>
    );
}

interface NewsPanelProps {
    onCreatePost?: () => void;
    onEditPost?: (postId: string) => void;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ onCreatePost, onEditPost }) => {
    const t = useTranslations('news');
    const { goToPanel } = useNavigationStore();
    const { setCurrentNewsPostId } = useAppContextStore();
    const { hasAnyRole } = useSessionStore();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const isAdmin = hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]);

    const postsParams = {
        page: 1,
        pageSize: 20,
        categoryId: selectedCategoryId ?? undefined,
        ...(isAdmin ? {} : { status: 'Published' }),
    };

    const { data: postsData, isLoading: isPostsLoading } = useNewsPosts(postsParams);
    const { data: categories } = useNewsCategories();

    const allPosts = postsData?.items ?? [];
    const pinnedPosts = allPosts.filter((p) => p.isPinned);
    const regularPosts = allPosts.filter((p) => !p.isPinned);
    const sortedPosts = [...pinnedPosts, ...regularPosts];

    const handleCardClick = (postId: string) => {
        setCurrentNewsPostId(postId);
        goToPanel(NEWS_PANEL_IDS.DETAIL);
    };

    return (
        <>
            <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                <Div style={{ paddingBottom: 0 }}>
                    <Button
                        size="m"
                        mode="primary"
                        stretched
                        onClick={onCreatePost}
                    >
                        {t('addPost')}
                    </Button>
                </Div>
            </PermissionGuard>

            {/* Category filter chips */}
            {categories && categories.length > 0 && (
                <div className="newsCategoryFilter">
                    <button
                        className={selectedCategoryId === null ? 'newsCategoryActive' : 'newsCategory'}
                        onClick={() => setSelectedCategoryId(null)}
                    >
                        {t('allCategories')}
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={selectedCategoryId === cat.id ? 'newsCategoryActive' : 'newsCategory'}
                            onClick={() => setSelectedCategoryId(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            )}

            <Div>
                {isPostsLoading ? (
                    <>
                        <NewsSkeletonCard />
                        <NewsSkeletonCard />
                        <NewsSkeletonCard />
                    </>
                ) : sortedPosts.length === 0 ? (
                    <div className="newsEmptyState">
                        <span className="newsEmptyIcon">📰</span>
                        <span className="newsEmptyText">{t('empty')}</span>
                    </div>
                ) : (
                    sortedPosts.map((post) => (
                        <NewsPostCard
                            key={post.id}
                            post={post}
                            onClick={() => handleCardClick(post.id)}
                            onEdit={onEditPost ? () => onEditPost(post.id) : undefined}
                        />
                    ))
                )}
            </Div>
        </>
    );
};
