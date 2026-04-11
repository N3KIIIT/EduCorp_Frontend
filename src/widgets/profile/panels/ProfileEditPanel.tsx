'use client';

import React, { useState } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    FormItem,
    Input,
    Button,
    Box,
    Snackbar,
} from '@vkontakte/vkui';
import { Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useSessionStore } from '@/entities/session/model/store';
import { ValidationError } from '@/shared/lib/errors/AppError';
import { useTranslations } from 'next-intl';
import { useUpdateUser } from "@/features/user/edit-profile";

type Props = { id: string };

export const ProfileEditPanel: React.FC<Props> = ({ id }) => {
    const { goBackPanel } = useNavigationStore();
    const { user } = useSessionStore();

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [snackbar, setSnackbar] = useState<React.ReactNode>(null);

    const { mutate: updateUser, isPending } = useUpdateUser();

    const showError = (message: string) =>
        setSnackbar(
            <Snackbar
                before={<Icon24ErrorCircleOutline fill="var(--vkui--color_accent_red)" />}
                onClose={() => setSnackbar(null)}
            >
                {message}
            </Snackbar>,
        );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        updateUser(
            { firstName, lastName },
            {
                onSuccess: () => {
                    goBackPanel();
                },
                onError: (err) => {
                    if (err instanceof ValidationError) {
                        const errors = err.details?.errors;
                        const detail = Array.isArray(errors) ? errors.join(', ') : '';
                        showError(detail ? `${err.message}: ${detail}` : err.message);
                    } else {
                        showError(err.message);
                    }
                }
            }
        );
    };

    return (
        <Panel id={id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
            >
                Редактирование
            </PanelHeader>

            <Group>
                <Box onSubmit={handleSubmit}>
                    <FormItem top="Имя">
                        <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={isPending}
                        />
                    </FormItem>

                    <FormItem top="Фамилия">
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={isPending}
                        />
                    </FormItem>

                    <FormItem>
                        <Button
                            size="l"
                            stretched
                            loading={isPending}
                            onClick={handleSubmit}
                        >
                            Сохранить
                        </Button>
                    </FormItem>
                </Box>
            </Group>
            {snackbar}
        </Panel>
    );
};

export default ProfileEditPanel;