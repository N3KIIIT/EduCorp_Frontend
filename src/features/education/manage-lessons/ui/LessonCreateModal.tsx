'use client';

import React, { useState } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Button,
    Select,
    Group,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateLesson } from '../api/lesson-api';
import type { AddLessonRequest, LessonType } from '@/lib/api-client/types.gen';
import {LESSON_MODAL_IDS} from "@/shared/config/navigation/modal-ids";

interface LessonCreateModalProps {
    courseId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const LESSON_TYPES: Array<{ value: LessonType; label: string }> = [
    { value: 'Text', label: 'Текстовый' },
    { value: 'Video', label: 'Видео' },
    { value: 'Audio', label: 'Аудио' },
];

export const LessonCreateModal: React.FC<LessonCreateModalProps> = ({ courseId, onClose, onSuccess }) => {
    const t = useTranslations('education.lessons.modal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [lessonType, setLessonType] = useState<LessonType>('Text');
    const [orderIndex, setOrderIndex] = useState(0);
    const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState('');
    const createLesson = useCreateLesson();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: AddLessonRequest = {
                courseId,
                title,
            };
            await createLesson.mutateAsync(request);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create lesson:', error);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setLessonType('Text');
        setOrderIndex(0);
        setEstimatedDurationMinutes('');
    };

    const handleClose = () => {
        resetForm();
        onClose();  
    };

    return (
        <ModalPage
            id={LESSON_MODAL_IDS.CREATE}
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
                    <FormItem top={t('lessonType')} htmlFor="lessonType">
                        <Select
                            id="lessonType"
                            value={lessonType}
                            onChange={(e) => setLessonType(e.target.value as LessonType)}
                            options={LESSON_TYPES}
                        />
                    </FormItem>
                    <FormItem top={t('orderIndex')} htmlFor="orderIndex">
                        <Input
                            id="orderIndex"
                            type="number"
                            value={orderIndex}
                            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                            min={0}
                        />
                    </FormItem>
                    <FormItem top={t('estimatedDuration')} htmlFor="estimatedDuration">
                        <Input
                            id="estimatedDuration"
                            type="number"
                            value={estimatedDurationMinutes}
                            onChange={(e) => setEstimatedDurationMinutes(e.target.value)}
                            placeholder={t('estimatedDurationPlaceholder')}
                            min={1}
                        />
                    </FormItem>
                </Group>

                <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
                    <Button
                        size="l"
                        stretched
                        type="submit"
                        loading={createLesson.isPending}
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
