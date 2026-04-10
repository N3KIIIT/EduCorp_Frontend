'use client';

import React from 'react';
import { Button, Group } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useQuestions, useDeleteQuestion } from '../api/question-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import '@/features/education/education.css';

interface QuestionListProps {
    testId: string;
    onEditQuestion?: (questionId: string) => void;
    onStartTest?: () => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ testId, onEditQuestion, onStartTest }) => {
    const t = useTranslations('education.questions');
    const tTests = useTranslations('education.tests');
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

    const startTestLabel = tTests('startTest');

    if (questionsQuery.isLoading) {
        return (
            <div style={{ padding: '8px 16px' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--vkui--color_separator_primary)', flexShrink: 0, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        <div style={{ height: 14, borderRadius: 7, background: 'var(--vkui--color_separator_primary)', flex: 1, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                    </div>
                ))}
            </div>
        );
    }

    if (questionsQuery.error) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">⚠️</div>
                <div className="eduEmptyText">{t('errorLoading')}</div>
            </div>
        );
    }

    if (!questionsQuery.data || questionsQuery.data.length === 0) {
        return (
            <>
                <div className="eduEmpty">
                    <div className="eduEmptyIcon">❓</div>
                    <div className="eduEmptyText">{t('noQuestions')}</div>
                </div>
                {onStartTest && (
                    <div style={{ padding: '8px 16px 24px' }}>
                        <Button size="l" stretched mode="primary" onClick={onStartTest}>
                            {startTestLabel}
                        </Button>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <Group>
                {questionsQuery.data.map((question, idx) => (
                    <div key={question.id} className="lessonRow">
                        {/* Order circle */}
                        <div className={`lessonIndex lessonIndex--${idx % 8}`}>
                            {Number(question.orderIndex)}
                        </div>

                        {/* Question text */}
                        <div className="lessonContent">
                            <div className="lessonTitle">{question.question}</div>
                        </div>

                        {/* Admin actions */}
                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <div className="lessonRowActions" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    appearance="negative"
                                    onClick={(e) => handleDeleteQuestion(question.id, e)}
                                >
                                    {t('delete')}
                                </Button>
                            </div>
                        </PermissionGuard>
                    </div>
                ))}
            </Group>

            {/* Start test button */}
            {onStartTest && (
                <div style={{ padding: '8px 16px 24px' }}>
                    <Button size="l" stretched mode="primary" onClick={onStartTest}>
                        {startTestLabel}
                    </Button>
                </div>
            )}
        </>
    );
};
