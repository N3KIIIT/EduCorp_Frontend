'use client';

import React from 'react';
import { Button, Group } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useTests, useDeleteTest } from '../api/test-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import '@/features/education/education.css';

interface TestListProps {
    courseId: string;
    onSelectTest?: (testId: string) => void;
}

function getTestTypeEmoji(type: string): string {
    switch (type?.toLowerCase()) {
        case 'quiz': return '🧠';
        case 'practice': return '💪';
        case 'exam': return '🎓';
        case 'survey': return '📊';
        default: return '📝';
    }
}

function getTestVariant(type: string): number {
    let hash = 0;
    for (let i = 0; i < type.length; i++) {
        hash = (hash * 31 + type.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 8;
}

export const TestList: React.FC<TestListProps> = ({ courseId, onSelectTest }) => {
    const t = useTranslations('education.tests');
    const testsQuery = useTests(courseId);
    const deleteTest = useDeleteTest();

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

    if (testsQuery.isLoading) {
        return (
            <div style={{ padding: '8px 16px' }}>
                {[0, 1].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--vkui--color_separator_primary)', flexShrink: 0, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ height: 14, borderRadius: 7, background: 'var(--vkui--color_separator_primary)', width: '60%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                            <div style={{ height: 11, borderRadius: 6, background: 'var(--vkui--color_separator_primary)', width: '40%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (testsQuery.error) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">⚠️</div>
                <div className="eduEmptyText">{t('errorLoading')}</div>
            </div>
        );
    }

    if (!testsQuery.data || testsQuery.data.length === 0) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">📋</div>
                <div className="eduEmptyText">{t('noTests')}</div>
            </div>
        );
    }

    return (
        <Group>
            {testsQuery.data.map((test, idx) => {
                const colorVariant = getTestVariant(test.type);
                const emoji = getTestTypeEmoji(test.type);

                return (
                    <div key={test.id} className="lessonRow" onClick={() => onSelectTest?.(test.id)}>
                        {/* Colored index circle */}
                        <div className={`lessonIndex lessonIndex--${colorVariant}`}>
                            {idx + 1}
                        </div>

                        {/* Title + subtitle */}
                        <div className="lessonContent">
                            <div className="lessonTitle">{emoji} {t(`testType.${test.type}`)}</div>
                            <div className="lessonSubtitle">
                                {test.passingScore && (
                                    <span>{t('passingScore')}: {test.passingScore}%</span>
                                )}
                                {test.passingScore && test.timeLimitSeconds && (
                                    <span className="lessonTypeDot" />
                                )}
                                {test.timeLimitSeconds && (
                                    <span>⏱ {Math.round(Number(test.timeLimitSeconds) / 60)} {t('minutes')}</span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <div className="lessonRowActions" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    appearance="negative"
                                    onClick={(e) => handleDeleteTest(test.id, e)}
                                >
                                    {t('delete')}
                                </Button>
                            </div>
                        </PermissionGuard>
                    </div>
                );
            })}
        </Group>
    );
};
