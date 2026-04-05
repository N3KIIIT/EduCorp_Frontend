'use client';

import React from 'react';
import {
    List,
    Button,
    Caption,
    Headline,
    Chip,
    Card,
    CardGrid,
    Box,
    Group,
    Tabs,
    TabsItem,
    Div,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useTests, useDeleteTest } from '../api/test-api';
import type { TestBriefResponse, TestType } from '@/lib/api-client/types.gen';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';

interface TestListProps {
    courseId: string;
    onSelectTest?: (testId: string) => void;
}

export const TestList: React.FC<TestListProps> = ({ courseId, onSelectTest }) => {
    const t = useTranslations('education.tests');
    const testsQuery = useTests(courseId);
    const deleteTest = useDeleteTest();
    const { openModal } = useNavigationStore();
    const { setCurrentTestId } = useAppContextStore();

    const handleDeleteTest = async (testId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteTest.mutateAsync(testId);
            } catch (error) {
                console.error('Failed to delete test:', error);
            }
        }
    };

    const handleSelectTest = (testId: string) => {
        setCurrentTestId(testId);
        onSelectTest?.(testId);
    };

    const handleAddQuestion = (testId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentTestId(testId);
        openModal('question-create');
    };

    if (testsQuery.isLoading) {
        return <Caption>{t('loading')}</Caption>;
    }

    if (testsQuery.error) {
        return <Caption>{t('errorLoading')}</Caption>;
    }

    if (!testsQuery.data || testsQuery.data.length === 0) {
        return <Caption>{t('noTests')}</Caption>;
    }

    return (
        <Group>
            <List>
                {testsQuery.data.map((test) => (
                    <Card
                        key={test.id}
                        mode="shadow"
                        onClick={() => handleSelectTest(test.id)}
                        style={{ margin: 8, cursor: 'pointer' }}
                    >
                        <Box style={{ padding: 12 }}>
                            <CardGrid>
                                <div style={{ flex: 1 }}>
                                    <Headline level="1" weight="2">
                                        {t(`testType.${test.type}`)}
                                    </Headline>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                        <Chip>
                                            {t(`testType.${test.type}`)}
                                        </Chip>
                                        {test.passingScore && (
                                            <Chip>
                                                {t('passingScore')}: {test.passingScore}%
                                            </Chip>
                                        )}
                                        {test.timeLimitSeconds && (
                                            <Chip>
                                                {t('duration')}: {Math.round(Number(test.timeLimitSeconds) / 60)} {t('minutes')}
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </CardGrid>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, marginTop: 8 }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Button
                                        size="s"
                                        mode="tertiary"
                                        onClick={(e) => handleAddQuestion(test.id, e)}
                                    >
                                        {t('addQuestion')}
                                    </Button>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Button
                                        size="s"
                                        mode="tertiary"
                                        onClick={(e) => handleDeleteTest(test.id, e)}
                                    >
                                        {t('delete')}
                                    </Button>
                                </div>
                            </div>
                        </Box>
                    </Card>
                ))}
            </List>
        </Group>
    );
};
