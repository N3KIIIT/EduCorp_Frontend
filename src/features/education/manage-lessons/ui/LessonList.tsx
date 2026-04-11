'use client';

import React, { useState, useEffect } from 'react';
import { Button, Group } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLessons, useDeleteLesson, useReorderLessons } from '../api/lesson-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import type { LessonBriefResponse } from '@/lib/api-client/types.gen';
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

/* ── Sortable row ─────────────────────────────────────────────────────────── */
interface SortableLessonRowProps {
    lesson: LessonBriefResponse;
    index: number;
    isDraggable: boolean;
    t: ReturnType<typeof useTranslations>;
    onSelect?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

const SortableLessonRow: React.FC<SortableLessonRowProps> = ({
    lesson,
    index,
    isDraggable,
    t,
    onSelect,
    onEdit,
    onDelete,
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: lesson.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const colorVariant = index % 8;
    const emoji = getLessonTypeEmoji(lesson.lessonType);

    return (
        <div ref={setNodeRef} style={style}>
            <div
                className="lessonRow"
                onClick={() => !isDragging && onSelect?.(lesson.id)}
            >
                {/* Drag handle — only visible/functional for admins */}
                {isDraggable && (
                    <div
                        className="lessonDragHandle"
                        {...attributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        title={t('dragToReorder')}
                    >
                        ⠿
                    </div>
                )}

                {/* Order circle */}
                <div className={`lessonIndex lessonIndex--${colorVariant}`}>
                    {index + 1}
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

                {/* Admin actions */}
                <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                    <div className="lessonRowActions" onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                            <Button size="s" mode="tertiary" onClick={() => onEdit(lesson.id)}>
                                {t('edit')}
                            </Button>
                        )}
                        <Button
                            size="s"
                            mode="tertiary"
                            appearance="negative"
                            onClick={(e) => onDelete(lesson.id, e)}
                        >
                            {t('delete')}
                        </Button>
                    </div>
                </PermissionGuard>
            </div>
        </div>
    );
};

/* ── Main list ────────────────────────────────────────────────────────────── */
export const LessonList: React.FC<LessonListProps> = ({ courseId, onEditLesson, onSelectLesson }) => {
    const t = useTranslations('education.lessons');
    const lessonsQuery = useLessons(courseId);
    const deleteLesson = useDeleteLesson();
    const reorderLessons = useReorderLessons();

    const [items, setItems] = useState<LessonBriefResponse[]>([]);

    // Sync local order with server data
    useEffect(() => {
        if (lessonsQuery.data) {
            const sorted = [...lessonsQuery.data].sort(
                (a, b) => Number(a.orderIndex) - Number(b.orderIndex)
            );
            setItems(sorted);
        }
    }, [lessonsQuery.data]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        setItems(reordered); // optimistic update

        reorderLessons.mutate({
            courseId,
            lessonIds: reordered.map((l) => l.id),
        });
    };

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

    if (items.length === 0) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">📖</div>
                <div className="eduEmptyText">{t('noLessons')}</div>
            </div>
        );
    }

    return (
        <Group>
            <PermissionGuard
                roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}
                fallback={
                    // Read-only list for students
                    <>
                        {items.map((lesson, idx) => (
                            <SortableLessonRow
                                key={lesson.id}
                                lesson={lesson}
                                index={idx}
                                isDraggable={false}
                                t={t}
                                onSelect={onSelectLesson}
                                onEdit={onEditLesson}
                                onDelete={handleDeleteLesson}
                            />
                        ))}
                    </>
                }
            >
                {/* Draggable list for admins */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((lesson, idx) => (
                            <SortableLessonRow
                                key={lesson.id}
                                lesson={lesson}
                                index={idx}
                                isDraggable={true}
                                t={t}
                                onSelect={onSelectLesson}
                                onEdit={onEditLesson}
                                onDelete={handleDeleteLesson}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </PermissionGuard>
        </Group>
    );
};
