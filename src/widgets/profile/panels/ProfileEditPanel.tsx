'use client';

import React, { useState } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    FormItem,
    Input,
    Button, Box
} from '@vkontakte/vkui';
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

    const { mutate: updateUser, isPending, error } = useUpdateUser();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        updateUser(
            { firstName, lastName },
            {
                onSuccess: () => {
                    console.log("User updated successfully");
                    goBackPanel();
                },
                onError: (err) => {
                    console.log("Error updating user: ", err);
                    if (err instanceof ValidationError) {
                        const errors = err.details?.errors;
                        if (Array.isArray(errors)) {
                            alert(err.message + '\n' + errors.join('\n'));
                        } else {
                            alert(err.message);
                        }
                    } else {
                        alert(err.message);
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
        </Panel>
    );
};

export default ProfileEditPanel;