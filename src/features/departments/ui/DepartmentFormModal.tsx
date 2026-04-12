'use client';

import React, { useState, useEffect } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Textarea,
    Button,
    Group,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateDepartment, useUpdateDepartment } from '../api/department-api';
import type { DepartmentBriefResponse } from '../types';
import { DEPARTMENT_MODAL_IDS } from '@/shared/config/navigation/modal-ids';

interface DepartmentFormModalProps {
    mode: 'create' | 'edit';
    department?: DepartmentBriefResponse;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
    mode,
    department,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('departments.modal');
    const createDept = useCreateDepartment();
    const updateDept = useUpdateDepartment();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [managerId, setManagerId] = useState('');

    useEffect(() => {
        if (mode === 'edit' && department) {
            setName(department.name);
            setManagerId(department.managerId ?? '');
            setDescription('');
        }
    }, [mode, department]);

    const isPending = createDept.isPending || updateDept.isPending;

    const resetForm = () => {
        setName('');
        setDescription('');
        setManagerId('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        const request = {
            name: name.trim(),
            description: description.trim() || null,
            managerId: managerId.trim() || null,
        };
        try {
            if (mode === 'create') {
                await createDept.mutateAsync(request);
            } else if (department) {
                await updateDept.mutateAsync({ id: department.id, ...request });
            }
            resetForm();
            onSuccess?.();
            onClose();
        } catch {
            // error handled by query
        }
    };

    const modalId = mode === 'create'
        ? DEPARTMENT_MODAL_IDS.CREATE
        : DEPARTMENT_MODAL_IDS.EDIT;

    return (
        <ModalPage
            id={modalId}
            header={
                <ModalPageHeader>
                    {mode === 'create' ? t('createTitle') : t('editTitle')}
                </ModalPageHeader>
            }
            onClose={handleClose}
        >
            <Group>
                <FormItem top={t('name')} required>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('namePlaceholder')}
                        disabled={isPending}
                    />
                </FormItem>
                <FormItem top={t('description')}>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('descriptionPlaceholder')}
                        disabled={isPending}
                        rows={2}
                    />
                </FormItem>
                <FormItem top={t('managerId')}>
                    <Input
                        value={managerId}
                        onChange={(e) => setManagerId(e.target.value)}
                        placeholder={t('managerIdPlaceholder')}
                        disabled={isPending}
                    />
                </FormItem>
            </Group>
            <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <Button size="l" stretched loading={isPending} onClick={handleSubmit} disabled={!name.trim()}>
                    {t('save')}
                </Button>
                <Button size="l" stretched mode="secondary" onClick={handleClose} disabled={isPending}>
                    {t('cancel')}
                </Button>
            </div>
        </ModalPage>
    );
};
