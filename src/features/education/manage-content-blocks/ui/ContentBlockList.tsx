'use client';

import React from 'react';
import { Cell, List, Button, Caption, Headline, Chip } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useContentBlocks, useDeleteContentBlock } from '../api/content-block-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import type { ContentBlockBriefResponse } from '@/lib/api-client/types.gen';
import {ROLES} from "@/entities/session";

interface ContentBlockListProps {
    lessonId: string;
    onEditContentBlock?: (contentBlockId: string) => void;
    onSelectContentBlock?: (contentBlock: ContentBlockBriefResponse) => void;
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

    const handleSelectContentBlock = (contentBlock: ContentBlockBriefResponse) => {
        onSelectContentBlock?.(contentBlock);
    };

    if (contentBlocksQuery.isLoading) {
        return <Caption>{t('loading')}</Caption>;
    }

    if (contentBlocksQuery.error) {
        return <Caption>{t('errorLoading')}</Caption>;
    }

    if (!contentBlocksQuery.data || contentBlocksQuery.data.length === 0) {
        return <Caption>{t('noContentBlocks')}</Caption>;
    }

    return (
        <List>
            {contentBlocksQuery.data.map((block) => (
                <Cell
                    key={block.id}
                    multiline
                    onClick={() => handleSelectContentBlock(block)}
                    after={
                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <Button
                                size="s"
                                mode="tertiary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditContentBlock?.(block.id);
                                }}
                            >
                                {t('edit')}
                            </Button>
                        </PermissionGuard>
                    }
                    subtitle={
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <Chip>
                                {block.type}
                            </Chip>
                            <PermissionGuard roles={['ADMIN', 'MANAGER']}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => handleDeleteContentBlock(block.id, e)}
                                >
                                    {t('delete')}
                                </Button>
                            </PermissionGuard>
                        </div>
                    }
                >
                    <Headline>
                        Content Block
                    </Headline>
                </Cell>
            ))}
        </List>
    );
};
