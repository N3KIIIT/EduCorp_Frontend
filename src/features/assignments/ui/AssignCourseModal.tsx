'use client';

import React, { useState } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Button,
    Group,
    Switch,
    Select,
    SegmentedControl,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateAssignment, useAssignToDepartment } from '../api/assignment-api';
import { ASSIGNMENT_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import { useCourses } from '@/features/education/manage-courses/api/course-api';
import { useSessionStore } from '@/entities/session/model/store';

interface AssignCourseModalProps {
    /** Pre-set target type — if provided, target selector is hidden */
    targetType?: 'employee' | 'department';
    /** Pre-set target ID */
    targetId?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AssignCourseModal: React.FC<AssignCourseModalProps> = ({
    targetType: presetType,
    targetId: presetId,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('assignments.modal');
    const { tenantId } = useSessionStore();
    const createAssignment = useCreateAssignment();
    const assignToDept = useAssignToDepartment();
    const { data: courses = [] } = useCourses(tenantId ?? undefined);

    const [targetType, setTargetType] = useState<'employee' | 'department'>(presetType ?? 'employee');
    const [targetId, setTargetId] = useState(presetId ?? '');
    const [courseId, setCourseId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [isRequired, setIsRequired] = useState(false);

    const isPending = createAssignment.isPending || assignToDept.isPending;

    const resetForm = () => {
        setTargetId(presetId ?? '');
        setCourseId('');
        setDeadline('');
        setIsRequired(false);
        setTargetType(presetType ?? 'employee');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!courseId || !targetId.trim()) return;
        try {
            const deadlineVal = deadline || null;
            if (targetType === 'employee') {
                await createAssignment.mutateAsync({
                    courseId,
                    assigneeId: targetId.trim(),
                    deadline: deadlineVal,
                    isRequired,
                });
            } else {
                await assignToDept.mutateAsync({
                    courseId,
                    departmentId: targetId.trim(),
                    deadline: deadlineVal,
                    isRequired,
                });
            }
            resetForm();
            onSuccess?.();
            onClose();
        } catch {
            // handled by mutation
        }
    };

    const courseOptions = courses.map((c) => ({ value: c.id, label: c.title }));

    return (
        <ModalPage
            id={ASSIGNMENT_MODAL_IDS.ASSIGN_COURSE}
            header={<ModalPageHeader>{t('title')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <Group>
                {/* Target type selector — only shown if not pre-set */}
                {!presetType && (
                    <FormItem top={t('targetType')}>
                        <SegmentedControl
                            value={targetType}
                            onChange={(v) => setTargetType(v as 'employee' | 'department')}
                            options={[
                                { value: 'employee', label: t('targetEmployee') },
                                { value: 'department', label: t('targetDepartment') },
                            ]}
                        />
                    </FormItem>
                )}

                {/* Course */}
                <FormItem top={t('course')} required>
                    {courseOptions.length > 0 ? (
                        <Select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            placeholder={t('coursePlaceholder')}
                            options={courseOptions}
                            disabled={isPending}
                        />
                    ) : (
                        <Input
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            placeholder={t('courseIdPlaceholder')}
                            disabled={isPending}
                        />
                    )}
                </FormItem>

                {/* Target ID — hidden if pre-set */}
                {!presetId && (
                    <FormItem top={targetType === 'employee' ? t('assigneeId') : t('departmentId')} required>
                        <Input
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            placeholder={targetType === 'employee' ? t('assigneeIdPlaceholder') : t('departmentIdPlaceholder')}
                            disabled={isPending}
                        />
                    </FormItem>
                )}

                {/* Deadline */}
                <FormItem top={t('deadline')}>
                    <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        disabled={isPending}
                    />
                </FormItem>

                {/* Required */}
                <FormItem top={t('isRequired')}>
                    <Switch
                        checked={isRequired}
                        onChange={(e) => setIsRequired(e.target.checked)}
                        disabled={isPending}
                    />
                </FormItem>
            </Group>

            <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <Button
                    size="l"
                    stretched
                    loading={isPending}
                    onClick={handleSubmit}
                    disabled={!courseId || !targetId.trim()}
                >
                    {t('assign')}
                </Button>
                <Button size="l" stretched mode="secondary" onClick={handleClose} disabled={isPending}>
                    {t('cancel')}
                </Button>
            </div>
        </ModalPage>
    );
};
