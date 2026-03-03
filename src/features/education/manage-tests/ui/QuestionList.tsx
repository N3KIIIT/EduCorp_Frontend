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
    Div,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useQuestions, useDeleteQuestion } from '../api/question-api';
import type { QuestionBriefResponse } from '@/lib/api-client/types.gen';

interface QuestionListProps {
    testId: string;
    onEditQuestion?: (questionId: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ testId, onEditQuestion }) => {
    const t = useTranslations('education.questions');
    const questionsQuery = useQuestions(testId);
    const deleteQuestion = useDeleteQuestion();

    const handleDeleteQuestion = async (questionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteQuestion.mutateAsync(questionId);
            } catch (error) {
                console.error('Failed to delete question:', error);
            }
        }
    };

    const getQuestionTypeLabel = (type: string): string => {
        const typeLabels: Record<string, string> = {
            'SingleChoice': t('type.singleChoice'),
            'MultipleChoice': t('type.multipleChoice'),
            'Text': t('type.text'),
            'Numeric': t('type.numeric'),
            'Matching': t('type.matching'),
            'Ordering': t('type.ordering'),
            'FillInTheBlank': t('type.fillInTheBlank'),
        };
        return typeLabels[type] || type;
    };

    if (questionsQuery.isLoading) {
        return <Caption>{t('loading')}</Caption>;
    }

    if (questionsQuery.error) {
        return <Caption>{t('errorLoading')}</Caption>;
    }

    if (!questionsQuery.data || questionsQuery.data.length === 0) {
        return <Caption>{t('noQuestions')}</Caption>;
    }

    return (
        <Group>
            <List>
                {questionsQuery.data.map((question, index) => (
                    <Card
                        key={question.id}
                        mode="shadow"
                        style={{ margin: 8 }}
                    >
                        <Box style={{ padding: 12 }}>
                            <CardGrid>
                                <div style={{ flex: 1 }}>
                                    <Headline level="2" weight="2">
                                        {index + 1}. {question.id}
                                    </Headline>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                        <Chip>
                                            {getQuestionTypeLabel(question.type)}
                                        </Chip>
                                        <Chip>
                                            {t('points')}: {question.points}
                                        </Chip>
                                    </div>
                                </div>
                            </CardGrid>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditQuestion?.(question.id);
                                    }}
                                >
                                    {t('edit')}
                                </Button>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => handleDeleteQuestion(question.id, e)}
                                >
                                    {t('delete')}
                                </Button>
                            </div>
                        </Box>
                    </Card>
                ))}
            </List>
        </Group>
    );
};
