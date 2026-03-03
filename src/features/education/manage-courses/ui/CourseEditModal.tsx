'use client';

import React, {useEffect, useState} from 'react';
import {Box, Button, FormItem, Header, Input, ModalPage, ModalPageHeader } from '@vkontakte/vkui';
import {useTranslations} from 'next-intl';
import {useCourse, useUpdateCourse} from '../api/course-api';
import {COURSE_MODAL_IDS} from "@/shared/config/navigation/modal-ids";

interface CourseEditModalProps {
    courseId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export const CourseEditModal: React.FC<CourseEditModalProps> = ({courseId, onClose, onSuccess}) => {
    const t = useTranslations('education.courses.modal');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    const courseQuery = useCourse(courseId);
    const updateCourse = useUpdateCourse();

    useEffect(() => {
        if (courseQuery.data) {
            setTitle(courseQuery.data.title);
            setDescription(courseQuery.data.description || '');
        }
    }, [courseQuery.data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateCourse.mutateAsync({
                id: courseId,
                title,
                description: description
            });
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to update course:', error);
        }
    };

    if (courseQuery.isLoading) {
        return <Box>Loading...</Box>;
    }

    if (courseQuery.error) {
        return <Box>Error loading course</Box>;
    }

    return (
        <ModalPage
            id={COURSE_MODAL_IDS.EDIT}
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            onClose={onClose}
        >
            <Box style={{
                padding: 16,
                border: '1px solid var(--vkui--color_separator_primary)',
                borderRadius: 8,
                marginTop: 16
            }}>
                <Header>{t('editTitle')}</Header>
                <form onSubmit={handleSubmit}>
                    <Box style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                        <FormItem top={t('title')}>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('titlePlaceholder')}
                                required
                            />
                        </FormItem>
                        <FormItem top={t('description')}>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('descriptionPlaceholder')}
                            />
                        </FormItem>
                        <Box style={{display: 'flex', gap: 8, padding: '0 16px 16px'}}>
                            <Button size="l" stretched type="submit" loading={updateCourse.isPending}>
                                {t('save')}
                            </Button>
                            <Button size="l" stretched mode="secondary" onClick={onClose}>
                                {t('cancel')}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </ModalPage>
    );
};
