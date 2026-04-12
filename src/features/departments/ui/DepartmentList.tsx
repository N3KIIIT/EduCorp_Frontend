'use client';

import React from 'react';
import {
    Spinner,
    Placeholder,
    Button,
    Div,
} from '@vkontakte/vkui';
import {
    Icon24Users,
    Icon24PenOutline,
    Icon24DeleteOutline,
    Icon24ChevronRight,
} from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useDepartments, useDeleteDepartment } from '../api/department-api';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import type { DepartmentBriefResponse } from '../types';
import '../departments.css';

interface DepartmentListProps {
    onView: (dept: DepartmentBriefResponse) => void;
    onEdit: (dept: DepartmentBriefResponse) => void;
    onCreate: () => void;
}

export const DepartmentList: React.FC<DepartmentListProps> = ({ onView, onEdit, onCreate }) => {
    const t = useTranslations('departments');
    const { data: departments = [], isLoading } = useDepartments();
    const deleteDept = useDeleteDepartment();

    const handleDelete = (dept: DepartmentBriefResponse) => {
        if (window.confirm(t('confirmDelete', { name: dept.name }))) {
            deleteDept.mutate(dept.id);
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
        <>
            <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                <Div style={{ padding: '8px 16px 0' }}>
                    <Button size="m" onClick={onCreate}>
                        {t('create')}
                    </Button>
                </Div>
            </PermissionGuard>

            {departments.length === 0 ? (
                <Placeholder icon={<Icon24Users />}>{t('empty')}</Placeholder>
            ) : (
                <div className="deptGrid">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            className="deptCard"
                            onClick={() => onView(dept)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && onView(dept)}
                        >
                            <div className="deptCardHeader">
                                <div className="deptCardAvatar">
                                    {dept.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="deptCardTitle">{dept.name}</span>
                                <Icon24ChevronRight style={{ color: 'var(--vkui--color_icon_tertiary)', flexShrink: 0 }} />
                            </div>
                            <div className="deptCardMeta">
                                <span className="deptBadge">
                                    <Icon24Users width={14} height={14} />
                                    {dept.employeeCount} {t('employees')}
                                </span>
                            </div>
                            <PermissionGuard roles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]}>
                                <div
                                    className="deptCardActions"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        size="s"
                                        mode="secondary"
                                        before={<Icon24PenOutline />}
                                        onClick={() => onEdit(dept)}
                                    >
                                        {t('edit')}
                                    </Button>
                                    <Button
                                        size="s"
                                        mode="secondary"
                                        appearance="negative"
                                        before={<Icon24DeleteOutline />}
                                        loading={deleteDept.isPending}
                                        onClick={() => handleDelete(dept)}
                                    >
                                        {t('delete')}
                                    </Button>
                                </div>
                            </PermissionGuard>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};
