'use client';

import React from 'react';
import {Button, Caption, Headline, CardScroll, Card, SimpleCell} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCourses, useDeleteCourse } from '../api/course-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import type { CourseBriefResponse } from '@/lib/api-client/types.gen';
import {ROLES} from "@/entities/session";

interface CourseListProps {
    tenantId: string;
    onEditCourse?: (courseId: string) => void;
    onViewCourse: (courseId: string) => void;
}

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

    const handleViewDetails = (course: CourseBriefResponse) => {
        onViewCourse(course.id);
        console.log('Selected course:', course);
    };

    if (coursesQuery.isLoading) {
        return <Caption>{t('loading')}</Caption>;
    }

    if (coursesQuery.error) {
        return <Caption>{t('errorLoading')}</Caption>;
    }

    if (!coursesQuery.data || coursesQuery.data.length === 0) {
        return <Caption>{t('noCourses')}</Caption>;
    }
    
    return (
        <CardScroll size="l" style={{ padding: 12, gap: 12}}>
            {coursesQuery.data.map((course) => (
                <Card key={course.id} mode="outline" style={{ minWidth: 280, maxWidth: 320 }}>
                    <SimpleCell
                        disabled={!onViewCourse}
                        onClick={() => handleViewDetails(course)}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '12px 16px' }}
                    >
                        <Headline weight="2" style={{ marginBottom: 8, textAlign: 'left' }}>
                            {course.title}
                        </Headline>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                            <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                                <Button
                                    size="s"
                                    mode="tertiary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditCourse?.(course.id);
                                    }}
                                    Component="span"
                                >
                                    {t('edit')}
                                </Button>
                            </PermissionGuard>

                            <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCourse(course.id, e);
                                    }}
                                    style={{ fontSize: 14, color: 'var(--vkui--color_text_secondary)' }}
                                >
                                    {t('delete')}
                                </Button>
                            </PermissionGuard>
                        </div>
                    </SimpleCell>
                </Card>
            ))}
        </CardScroll>
    );
};
