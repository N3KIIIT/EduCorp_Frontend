'use client';

import React, { useState } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Button,
    Group,
    Select,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useAddEmployee } from '../api/department-api';
import { DEPARTMENT_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import { useTenant } from '@/features/admin/manage-tenants/api/admin-api';
import { useSessionStore } from '@/entities/session/model/store';
import type { TenantGeneralResponse, TenantUserResponse } from '@/lib/api-client/types.gen';

interface AddEmployeeModalProps {
    departmentId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
    departmentId,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('departments.addEmployee');
    const { tenantId } = useSessionStore();
    const addEmployee = useAddEmployee();
    const { data: tenantData } = useTenant(tenantId ?? '');
    const tenant = tenantData as TenantGeneralResponse | undefined;

    const [userId, setUserId] = useState('');

    const users: TenantUserResponse[] = tenant?.users ?? [];

    const isPending = addEmployee.isPending;

    const handleClose = () => {
        setUserId('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!userId.trim()) return;
        try {
            await addEmployee.mutateAsync({ departmentId, userId: userId.trim() });
            setUserId('');
            onSuccess?.();
            onClose();
        } catch {
            // error handled by query
        }
    };

    return (
        <ModalPage
            id={DEPARTMENT_MODAL_IDS.ADD_EMPLOYEE}
            header={<ModalPageHeader>{t('title')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <Group>
                {users.length > 0 ? (
                    <FormItem top={t('selectUser')}>
                        <Select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder={t('selectUserPlaceholder')}
                            disabled={isPending}
                            options={users.map((u) => ({
                                value: u.userId,
                                label: u.firstName || u.userName || u.userId,
                            }))}
                        />
                    </FormItem>
                ) : (
                    <FormItem top={t('userId')}>
                        <Input
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder={t('userIdPlaceholder')}
                            disabled={isPending}
                        />
                    </FormItem>
                )}
            </Group>
            <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
                <Button size="l" stretched loading={isPending} onClick={handleSubmit} disabled={!userId.trim()}>
                    {t('add')}
                </Button>
                <Button size="l" stretched mode="secondary" onClick={handleClose} disabled={isPending}>
                    {t('cancel')}
                </Button>
            </div>
        </ModalPage>
    );
};
