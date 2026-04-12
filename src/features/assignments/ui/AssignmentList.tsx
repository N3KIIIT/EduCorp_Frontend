'use client';

import React, { useState } from 'react';
import {
    Spinner,
    Placeholder,
    Button,
    Div,
} from '@vkontakte/vkui';
import { Icon24EducationOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useAssignments, useMyAssignments, useRevokeAssignment } from '../api/assignment-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import type { AssignmentStatus } from '../types';
import '../assignments.css';

const STATUS_FILTERS: Array<AssignmentStatus | 'All'> = [
    'All', 'Pending', 'InProgress', 'Completed', 'Overdue', 'Revoked',
];

interface AssignmentListProps {
    /** Show only current user's assignments */
    myOnly?: boolean;
    /** Filter by department */
    departmentId?: string;
    /** Filter by course */
    courseId?: string;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const AssignmentList: React.FC<AssignmentListProps> = ({
    myOnly = false,
    departmentId,
    courseId,
}) => {
    const t = useTranslations('assignments');
    const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'All'>('All');

    const revokeAssignment = useRevokeAssignment();

    const filters = {
        departmentId: departmentId || undefined,
        courseId: courseId || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
    };

    const allQuery = useAssignments(myOnly ? {} : filters);
    const myQuery = useMyAssignments();

    const rawData = myOnly ? (myQuery.data ?? []) : (allQuery.data ?? []);
    const isLoading = myOnly ? myQuery.isLoading : allQuery.isLoading;

    // client-side filter for myOnly mode
    const data = myOnly && statusFilter !== 'All'
        ? rawData.filter((a) => a.status === statusFilter)
        : rawData;

    const handleRevoke = (id: string) => {
        if (window.confirm(t('revokeConfirm'))) {
            revokeAssignment.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Spinner size="m" />
            </Div>
        );
    }

    return (
        <div>
            {/* Status filter chips */}
            <div className="assignFilters">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        className={`assignFilterChip${statusFilter === s ? ' assignFilterChip--active' : ''}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {t(`status.${s}`)}
                    </button>
                ))}
            </div>

            {data.length === 0 ? (
                <Placeholder icon={<Icon24EducationOutline />}>{t('empty')}</Placeholder>
            ) : (
                data.map((assignment) => (
                    <div key={assignment.id} className="assignmentRow">
                        <div className="assignmentInfo">
                            <div className="assignmentCourse">
                                {t('courseLabel')}: {assignment.courseId}
                            </div>
                            <div className="assignmentMeta">
                                <span className={`assignBadge assignBadge--${assignment.status}`}>
                                    {t(`status.${assignment.status}`)}
                                </span>
                                {assignment.isRequired && (
                                    <span className="assignBadge assignBadge--required">
                                        {t('required')}
                                    </span>
                                )}
                                {assignment.deadline && (
                                    <span className={`assignDeadline${assignment.isOverdue ? ' assignDeadline--overdue' : ''}`}>
                                        {t('deadline')}: {formatDate(assignment.deadline)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                            {assignment.status !== 'Revoked' && (
                                <Button
                                    size="s"
                                    mode="secondary"
                                    appearance="negative"
                                    loading={revokeAssignment.isPending}
                                    onClick={() => handleRevoke(assignment.id)}
                                >
                                    {t('revoke')}
                                </Button>
                            )}
                        </PermissionGuard>
                    </div>
                ))
            )}
        </div>
    );
};
