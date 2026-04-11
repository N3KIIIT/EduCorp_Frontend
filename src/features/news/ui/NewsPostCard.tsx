'use client';

import React from 'react';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import type { NewsPostBriefResponse, NewsPostStatus } from '../types';
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

function getStatusClassName(status: NewsPostStatus): string {
    switch (status) {
        case 'Draft': return 'newsStatusDraft';
        case 'Published': return 'newsStatusPublished';
        case 'Archived': return 'newsStatusArchived';
        default: return 'newsStatusDraft';
    }
}

function getStatusLabel(status: NewsPostStatus): string {
    switch (status) {
        case 'Draft': return 'Черновик';
        case 'Published': return 'Опубликовано';
        case 'Archived': return 'Архив';
        default: return status;
    }
}

interface NewsPostCardProps {
    post: NewsPostBriefResponse;
    onClick: () => void;
    onEdit?: () => void;
}

export const NewsPostCard: React.FC<NewsPostCardProps> = ({ post, onClick, onEdit }) => {
    const displayDate = formatDate(post.publishedAt ?? post.createdAt);

    return (
        <div
            className="newsCard"
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
        >
            {post.imageUrl && (
                <img
                    className="newsCardImage"
                    src={post.imageUrl}
                    alt={post.title}
                />
            )}
            <div className="newsCardBody">
                {post.isPinned && (
                    <span className="newsPinBadge" aria-label="Закреплено">📌 </span>
                )}
                <div className="newsCardTitle">{post.title}</div>
                {post.preview && (
                    <div className="newsCardPreview">{post.preview}</div>
                )}
                <div className="newsCardMeta">
                    {post.categoryName && (
                        <span className="newsCategory">{post.categoryName}</span>
                    )}
                    {displayDate && (
                        <span className="newsCardDate">{displayDate}</span>
                    )}
                    {post.authorName && (
                        <span className="newsCardDate">{post.authorName}</span>
                    )}
                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        <>
                            {(post.status === 'Draft' || post.status === 'Archived') && (
                                <span className={getStatusClassName(post.status)}>
                                    {getStatusLabel(post.status)}
                                </span>
                            )}
                            {onEdit && (
                                <button
                                    className="newsEditBtn"
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    aria-label="Редактировать"
                                >
                                    ✏️
                                </button>
                            )}
                        </>
                    </PermissionGuard>
                </div>
            </div>
        </div>
    );
};
