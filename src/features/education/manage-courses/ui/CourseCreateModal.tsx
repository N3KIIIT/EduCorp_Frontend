'use client';

import React, { useState } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Button,
    Switch,
    Group,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateCourse } from '../api/course-api';
import type { CreateCourseRequest } from '@/lib/api-client/types.gen';
import {COURSE_MODAL_IDS} from "@/shared/config/navigation/modal-ids";

interface CourseCreateModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

export const CourseCreateModal: React.FC<CourseCreateModalProps> = ({ onClose, onSuccess }) => {
    const t = useTranslations('education.courses.modal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const createCourse = useCreateCourse();
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: CreateCourseRequest = {
                title,
                description: description || null,
                isPublic,
            };
            await createCourse.mutateAsync(request);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create course:', error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setIsPublic(true);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <ModalPage
            id={COURSE_MODAL_IDS.CREATE}
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <Group>
                    <FormItem top={t('title')} htmlFor="title">
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('titlePlaceholder')}
                            required
                        />
                    </FormItem>
                    <FormItem top={t('description')} htmlFor="description">
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                        />
                    </FormItem>
                    <FormItem
                    top={t('isPublic')}
                    >
                        <Switch
                            checked={isPublic}
                            onChange={(event) => setIsPublic(event.target.checked)}
                        >
                        </Switch>
                    </FormItem>
                </Group>

                <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
                    <Button
                        size="l"
                        stretched
                        type="submit"
                        loading={createCourse.isPending}
                    >
                        {t('save')}
                    </Button>
                    <Button
                        size="l"
                        stretched
                        mode="secondary"
                        onClick={handleClose}
                    >
                        {t('cancel')}
                    </Button>
                </div>
            </form>
        </ModalPage>
    );
};
