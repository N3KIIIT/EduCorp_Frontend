'use client';

import React from 'react';
 import {List, Button, Caption, Headline, Chip, Card, CardGrid, Div, Group, Box, ModalRoot} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useLessons, useDeleteLesson } from '../api/lesson-api';
import type { LessonBriefResponse } from '@/lib/api-client/types.gen';
import {CourseCreateModal} from "@/features/education/manage-courses/ui/CourseCreateModal";
import {LessonCreateModal} from "@/features/education/manage-lessons/ui/LessonCreateModal";
import {useNavigationStore} from "@/shared/lib/navigation/store";

interface LessonListProps {
    courseId: string;
    onEditLesson?: (lessonId: string) => void;
    onSelectLesson?: (lessonId: string) => void;
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

    const handleSelectLesson = (lessonId: string) => {
        onSelectLesson?.(lessonId);
    };

    if (lessonsQuery.isLoading) {
        return <Caption>{t('loading')}</Caption>;
    }

    if (lessonsQuery.error) {
        return <Caption>{t('errorLoading')}</Caption>;
    }

    if (!lessonsQuery.data || lessonsQuery.data.length === 0) {
        return <Caption>{t('noLessons')}</Caption>;
    }


    return (
        <Group>
            <List>
                {lessonsQuery.data.map((lesson) => (
                    <Card
                        key={lesson.id}
                        mode="shadow"
                        onClick={() => handleSelectLesson(lesson.id)}
                        style={{ margin: 8, cursor: 'pointer' }}
                    >
                        <Box style={{ padding: 12 }}>
                            <CardGrid>
                                <div style={{ flex: 1 }}>
                                    <Headline level="1" weight="2">
                                        {lesson.orderIndex}. {lesson.title}
                                    </Headline>
                                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                        <Chip>
                                            {t(`lessonType.${lesson.lessonType}`)}
                                        </Chip>
                                        {lesson.estimatedDurationMinutes && (
                                            <Chip>
                                                {lesson.estimatedDurationMinutes} {t('minutes')}
                                            </Chip>
                                        )}
                                    </div>
                                </div>
                            </CardGrid>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditLesson?.(lesson.id);
                                    }}
                                >
                                    {t('edit')}
                                </Button>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => handleDeleteLesson(lesson.id, e)}
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
