'use client';

import React from 'react';
import { Button } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCourses, useDeleteCourse } from '../api/course-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import type { CourseBriefResponse } from '@/lib/api-client/types.gen';
import { ROLES } from '@/entities/session';
import '@/features/education/education.css';

interface CourseListProps {
    tenantId?: string;
    onEditCourse?: (courseId: string) => void;
    onViewCourse: (courseId: string) => void;
}

function getCoverVariant(title: string): number {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash) % 8;
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return '';
    }
}

interface CourseCardProps {
    course: CourseBriefResponse;
    onView: () => void;
    onEdit?: () => void;
    onDelete: (e: React.MouseEvent) => void;
    t: ReturnType<typeof useTranslations>;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onView, onEdit, onDelete, t }) => {
    const variant = getCoverVariant(course.title);

    return (
        <div className="courseCard" onClick={onView} role="button" tabIndex={0}>
            {/* Gradient cover */}
            <div className={`courseCover courseCover--${variant}`}>
                <span className="courseCoverLetter">{course.title.charAt(0)}</span>
            </div>

            {/* Card body */}
            <div className="courseCardBody">
                <div className="courseTitle">{course.title}</div>

                {course.description && (
                    <div className="courseDescription">{course.description}</div>
                )}

                <div className="courseCardMeta">
                    <span className="courseMetaBadge">
                        {course.isPublic ? t('public') : t('private')}
                    </span>
                    {course.createdAt && (
                        <span className="courseMetaBadge">{formatDate(course.createdAt)}</span>
                    )}
                </div>

                {/* Progress bar — placeholder until progress API is integrated */}
                <div className="eduProgressBar">
                    <div className="eduProgressFill" style={{ width: '0%' }} />
                </div>

                <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                    <div className="courseCardActions" onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                            <Button size="s" mode="secondary" onClick={onEdit}>
                                {t('edit')}
                            </Button>
                        )}
                        <Button size="s" mode="secondary" appearance="negative" onClick={onDelete}>
                            {t('delete')}
                        </Button>
                    </div>
                </PermissionGuard>
            </div>
        </div>
    );
};

export const CourseList: React.FC<CourseListProps> = ({ tenantId, onEditCourse, onViewCourse }) => {
    const t = useTranslations('education.courses');
    const coursesQuery = useCourses(tenantId);
    const deleteCourse = useDeleteCourse();

    const handleDeleteCourse = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('confirmDelete'))) {
            try {
                await deleteCourse.mutateAsync(courseId);
            } catch (error) {
                console.error('Failed to delete course:', error);
            }
        }
    };

    if (coursesQuery.isLoading) {
        return (
            <div className="courseGrid">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="skeletonCard">
                        <div className="skeletonCover" />
                        <div className="skeletonBody">
                            <div className="skeletonLine skeletonLine--medium" />
                            <div className="skeletonLine skeletonLine--short" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (coursesQuery.error) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">⚠️</div>
                <div className="eduEmptyText">{t('errorLoading')}</div>
            </div>
        );
    }

    if (!coursesQuery.data || coursesQuery.data.length === 0) {
        return (
            <div className="eduEmpty">
                <div className="eduEmptyIcon">📚</div>
                <div className="eduEmptyText">{t('noCourses')}</div>
            </div>
        );
    }

    return (
        <div className="courseGrid">
            {coursesQuery.data.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onView={() => onViewCourse(course.id)}
                    onEdit={onEditCourse ? () => onEditCourse(course.id) : undefined}
                    onDelete={(e) => handleDeleteCourse(course.id, e)}
                    t={t}
                />
            ))}
        </div>
    );
};
