'use client';

import React from 'react';
import { Button, Group } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useLessons, useDeleteLesson } from '../api/lesson-api';
import '@/features/education/education.css';

interface LessonListProps {
    courseId: string;
    onEditLesson?: (lessonId: string) => void;
    onSelectLesson?: (lessonId: string) => void;
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

export const LessonList: React.FC<LessonListProps> = ({ courseId, onEditLesson, onSelectLesson }) => {
    const t = useTranslations('education.lessons');
    const lessonsQuery = useLessons(courseId);
    const deleteLesson = useDeleteLesson();

    const handleDeleteLesson = async (lessonId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteLesson.mutateAsync(lessonId);
            } catch (error) {
                console.error('Failed to delete lesson:', error);
            }
        }
    };

    if (lessonsQuery.isLoading) {
        return (
            <div style={{ padding: '8px 16px' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--vkui--color_separator_primary)', flexShrink: 0, animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ height: 14, borderRadius: 7, background: 'var(--vkui--color_separator_primary)', width: '70%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                            <div style={{ height: 11, borderRadius: 6, background: 'var(--vkui--color_separator_primary)', width: '45%', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (lessonsQuery.error) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">⚠️</div>
                <div className="eduEmptyText">{t('errorLoading')}</div>
            </div>
        );
    }

    if (!lessonsQuery.data || lessonsQuery.data.length === 0) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">📖</div>
                <div className="eduEmptyText">{t('noLessons')}</div>
            </div>
        );
    }

    return (
        <Group>
            {lessonsQuery.data.map((lesson, idx) => {
                const colorVariant = idx % 8;
                const emoji = getLessonTypeEmoji(lesson.lessonType);

                return (
                    <div key={lesson.id} className="lessonRow" onClick={() => onSelectLesson?.(lesson.id)}>
                        {/* Numbered index circle */}
                        <div className={`lessonIndex lessonIndex--${colorVariant}`}>
                            {Number(lesson.orderIndex)}
                        </div>

                        {/* Title + subtitle */}
                        <div className="lessonContent">
                            <div className="lessonTitle">{lesson.title}</div>
                            <div className="lessonSubtitle">
                                <span>{emoji} {t(`lessonType.${lesson.lessonType}`)}</span>
                                {lesson.estimatedDurationMinutes && (
                                    <>
                                        <span className="lessonTypeDot" />
                                        <span>{lesson.estimatedDurationMinutes} {t('minutes')}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="lessonRowActions" onClick={(e) => e.stopPropagation()}>
                            {onEditLesson && (
                                <Button size="s" mode="tertiary" onClick={() => onEditLesson(lesson.id)}>
                                    {t('edit')}
                                </Button>
                            )}
                            <Button size="s" mode="tertiary" onClick={(e) => handleDeleteLesson(lesson.id, e)}>
                                {t('delete')}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </Group>
    );
};
