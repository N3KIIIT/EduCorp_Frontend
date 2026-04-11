'use client';

import React, { useState, useEffect } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Input,
    Textarea,
    Select,
    Button,
    Group,
    Spinner,
    Div,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { NEWS_MODAL_IDS } from '@/shared/config/navigation/modal-ids';
import {
    useCreateNewsPost,
    useUpdateNewsPost,
    useNewsPost,
    useNewsCategories,
} from '../api/news-api';
import type { CreateNewsPostRequest, UpdateNewsPostRequest } from '../types';

interface NewsCreateEditModalProps {
    mode: 'create' | 'edit';
    postId?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const NewsCreateEditModal: React.FC<NewsCreateEditModalProps> = ({
    mode,
    postId,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('news');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [imageUrl, setImageUrl] = useState('');

    const { data: categories } = useNewsCategories();
    const postQuery = useNewsPost(mode === 'edit' && postId ? postId : '');

    const createPost = useCreateNewsPost();
    const updatePost = useUpdateNewsPost();

    // Pre-fill form when editing
    useEffect(() => {
        if (mode === 'edit' && postQuery.data) {
            const post = postQuery.data;
            setTitle(post.title);
            setContent(post.content);
            setCategoryId(post.categoryId ?? '');
            setImageUrl(post.imageUrl ?? '');
        }
    }, [mode, postQuery.data]);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setCategoryId('');
        setImageUrl('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: CreateNewsPostRequest | UpdateNewsPostRequest = {
            title,
            content,
            categoryId: categoryId || null,
            imageUrl: imageUrl || null,
        };

        try {
            if (mode === 'create') {
                await createPost.mutateAsync(payload as CreateNewsPostRequest);
            } else if (mode === 'edit' && postId) {
                await updatePost.mutateAsync({ id: postId, ...payload } as UpdateNewsPostRequest & { id: string });
            }
            onSuccess();
            resetForm();
        } catch (error) {
            console.error('[NewsCreateEditModal] Failed to save post:', error);
        }
    };

    const isPending = createPost.isPending || updatePost.isPending;
    const isLoadingPost = mode === 'edit' && postQuery.isLoading;

    const categoryOptions = [
        { value: '', label: t('noCategory') },
        ...(categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []),
    ];

    return (
        <ModalPage
            id={NEWS_MODAL_IDS.CREATE}
            header={
                <ModalPageHeader>
                    {mode === 'create' ? t('createPost') : t('editPost')}
                </ModalPageHeader>
            }
            onClose={handleClose}
        >
            {isLoadingPost ? (
                <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <Spinner size="m" />
                </Div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Group>
                        <FormItem top={t('titleField')} htmlFor="news-title">
                            <Input
                                id="news-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('titlePlaceholder')}
                                required
                            />
                        </FormItem>

                        <FormItem top={t('contentField')} htmlFor="news-content">
                            <Textarea
                                id="news-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t('contentPlaceholder')}
                                rows={8}
                                required
                            />
                        </FormItem>

                        <FormItem top={t('categoryField')} htmlFor="news-category">
                            <Select
                                id="news-category"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                options={categoryOptions}
                            />
                        </FormItem>

                        <FormItem top={t('imageUrlField')} htmlFor="news-imageUrl">
                            <Input
                                id="news-imageUrl"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder={t('imageUrlPlaceholder')}
                            />
                        </FormItem>
                    </Group>

                    <Div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            size="l"
                            stretched
                            type="submit"
                            loading={isPending}
                        >
                            {t('save')}
                        </Button>
                        <Button
                            size="l"
                            stretched
                            mode="secondary"
                            onClick={handleClose}
                            disabled={isPending}
                        >
                            {t('cancel')}
                        </Button>
                    </Div>
                </form>
            )}
        </ModalPage>
    );
};
