'use client';

import React from 'react';
import { Button } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useContentBlocks, useDeleteContentBlock } from '../api/content-block-api';
import { ContentBlockRenderer } from './ContentBlockRenderer';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import type { ContentBlockBriefResponse } from '@/lib/api-client/types.gen';
import { ROLES } from '@/entities/session';
import '@/features/education/education.css';

interface ContentBlockListProps {
    lessonId: string;
    onEditContentBlock?: (contentBlockId: string) => void;
    onSelectContentBlock?: (contentBlock: ContentBlockBriefResponse) => void;
}

function getBlockTypeEmoji(type: string): string {
    switch (type) {
        case 'Text': return '📝';
        case 'Image': return '🖼';
        case 'Video': return '🎬';
        case 'Audio': return '🎵';
        case 'Pdf': return '📄';
        case 'Embedded': return '🔗';
        case 'SectionBreak': return '➖';
        case 'Interactive': return '🎮';
        default: return '📦';
    }
}

export const ContentBlockList: React.FC<ContentBlockListProps> = ({
    lessonId,
    onEditContentBlock,
    onSelectContentBlock,
}) => {
    const t = useTranslations('education.contentBlocks');
    const contentBlocksQuery = useContentBlocks(lessonId);
    const deleteContentBlock = useDeleteContentBlock();

    const handleDeleteContentBlock = async (contentBlockId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteContentBlock.mutateAsync(contentBlockId);
            } catch (error) {
                console.error('Failed to delete content block:', error);
            }
        }
    };

    if (contentBlocksQuery.isLoading) {
        return (
            <div style={{ padding: '8px 16px' }}>
                {[0, 1].map((i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ height: 16, borderRadius: 8, background: 'var(--vkui--color_separator_primary)', width: '30%', marginBottom: 8, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: 80, borderRadius: 12, background: 'var(--vkui--color_separator_primary)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (contentBlocksQuery.error) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">⚠️</div>
                <div className="eduEmptyText">{t('errorLoading')}</div>
            </div>
        );
    }

    if (!contentBlocksQuery.data || contentBlocksQuery.data.length === 0) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">📭</div>
                <div className="eduEmptyText">{t('noContentBlocks')}</div>
            </div>
        );
    }

    return (
        <div className="cbList">
            {contentBlocksQuery.data.map((block) => (
                <div
                    key={block.id}
                    className="cbBlock"
                    onClick={() => onSelectContentBlock?.(block)}
                >
                    {/* Block header: type badge + admin actions */}
                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        <div className="cbBlockHeader" onClick={(e) => e.stopPropagation()}>
                            <span className="cbTypeBadge">
                                {getBlockTypeEmoji(block.type)} {t(`type.${block.type}`)}
                            </span>
                            <div className="cbBlockActions">
                                {onEditContentBlock && (
                                    <Button
                                        size="s"
                                        mode="tertiary"
                                        onClick={() => onEditContentBlock(block.id)}
                                    >
                                        {t('edit')}
                                    </Button>
                                )}
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    appearance="negative"
                                    onClick={(e) => handleDeleteContentBlock(block.id, e)}
                                >
                                    {t('delete')}
                                </Button>
                            </div>
                        </div>
                    </PermissionGuard>

                    {/* Actual block content */}
                    <div className="cbBlockContent">
                        <ContentBlockRenderer blockId={block.id} />
                    </div>
                </div>
            ))}
        </div>
    );
};
