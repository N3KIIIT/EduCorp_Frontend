'use client';

import React, { useState, useMemo } from 'react';
import {
    ModalPage,
    ModalPageHeader,
    FormItem,
    Select,
    Textarea,
    Input,
    Button,
    Switch, Group,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useCreateContentBlock } from '../api/content-block-api';
import type { AddContentBlockRequest, IContentBlockDataRequest } from '@/lib/api-client/types.gen';
import {CONTENT_BLOCK_MODAL_IDS} from "@/shared/config/navigation/modal-ids";

interface ContentBlockCreateModalProps {
    lessonId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const CONTENT_BLOCK_TYPES = [
    { value: 'Text', label: 'Текст' },
    { value: 'Image', label: 'Изображение' },
    { value: 'Video', label: 'Видео' },
    { value: 'Audio', label: 'Аудио' },
    { value: 'Pdf', label: 'PDF' },
    { value: 'Embedded', label: 'Встраиваемый контент' },
    { value: 'Interactive', label: 'Интерактивный' },
    { value: 'SectionBreak', label: 'Разделитель' },
] as const;

export const ContentBlockCreateModal: React.FC<ContentBlockCreateModalProps> = ({
    lessonId,
    onClose,
    onSuccess,
}) => {
    const t = useTranslations('education.contentBlocks.modal');
    const [blockType, setBlockType] = useState<typeof CONTENT_BLOCK_TYPES[number]['value']>('Text');
    const [orderIndex, setOrderIndex] = useState(0);
    
    // Text content state
    const [htmlContent, setHtmlContent] = useState('');
    const [enableComments, setEnableComments] = useState(false);
    const [enableHighlights, setEnableHighlights] = useState(false);
    
    // Image content state
    const [imageUrl, setImageUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [caption, setCaption] = useState('');
    
    // Video content state
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [autoPlay, setAutoPlay] = useState(false);
    const [showControls, setShowControls] = useState(true);
    
    // Audio content state
    const [audioUrl, setAudioUrl] = useState('');
    const [showTranscript, setShowTranscript] = useState(false);
    const [transcript, setTranscript] = useState('');
    
    // PDF content state
    const [pdfUrl, setPdfUrl] = useState('');
    const [enableDownload, setEnableDownload] = useState(true);
    const [enableAnnotations, setEnableAnnotations] = useState(false);
    
    // Embedded content state
    const [embedUrl, setEmbedUrl] = useState('');
    const [embedWidth, setEmbedWidth] = useState('100%');
    const [embedHeight, setEmbedHeight] = useState('400px');
    
    const createContentBlock = useCreateContentBlock();

    const buildContentData = useMemo((): IContentBlockDataRequest => {
        switch (blockType) {
            case 'Text':
                return {
                    type: 'Text',
                    htmlContent,
                    enableComments,
                    enableHighlights,
                };
            case 'Image':
                return {
                    type: 'Image',
                    imageUrl,
                    altText: altText || null,
                    caption: caption || null,
                    size: 'Medium',
                    zoomable: true,
                };
            case 'Video':
                return {
                    type: 'Video',
                    videoUrl,
                    thumbnailUrl: thumbnailUrl || null,
                    autoPlay,
                    showControls,
                };
            case 'Audio':
                return {
                    type: 'Audio',
                    audioUrl,
                    showTranscript,
                    transcript: transcript || null,
                };
            case 'Pdf':
                return {
                    type: 'Pdf',
                    pdfUrl,
                    enableDownload,
                    enableAnnotations,
                };
            case 'Embedded':
                return {
                    type: 'Embedded',
                    embedUrl,
                    width: parseInt(embedWidth) || 800,
                    height: parseInt(embedHeight) || 400,
                    responsive: true,
                };
            case 'Interactive':
                return {
                    type: 'Interactive',
                    interactiveType: 0,
                    configuration: {},
                    requireCompletion: false,
                };
            case 'SectionBreak':
                return {
                    type: 'SectionBreak',
                    style: 0,
                };
            default:
                return { type: 'Text', htmlContent: '', enableComments: false, enableHighlights: false };
        }
    }, [
        blockType,
        htmlContent,
        enableComments,
        enableHighlights,
        imageUrl,
        altText,
        caption,
        videoUrl,
        thumbnailUrl,
        autoPlay,
        showControls,
        audioUrl,
        showTranscript,
        transcript,
        pdfUrl,
        enableDownload,
        enableAnnotations,
        embedUrl,
        embedWidth,
        embedHeight,
    ]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: AddContentBlockRequest = {
                lessonId,
                data: buildContentData,
                orderIndex,
            };
            await createContentBlock.mutateAsync(request);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to create content block:', error);
        }
    };

    const resetForm = () => {
        setBlockType('Text');
        setOrderIndex(0);
        setHtmlContent('');
        setEnableComments(false);
        setEnableHighlights(false);
        setImageUrl('');
        setAltText('');
        setCaption('');
        setVideoUrl('');
        setThumbnailUrl('');
        setAutoPlay(false);
        setShowControls(true);
        setAudioUrl('');
        setShowTranscript(false);
        setTranscript('');
        setPdfUrl('');
        setEnableDownload(true);
        setEnableAnnotations(false);
        setEmbedUrl('');
        setEmbedWidth('100%');
        setEmbedHeight('400px');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <ModalPage
            id={CONTENT_BLOCK_MODAL_IDS.CREATE}
            header={<ModalPageHeader>{t('createTitle')}</ModalPageHeader>}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <Group>
                    <FormItem top={t('blockType')} htmlFor="blockType">
                        <Select
                            id="blockType"
                            value={blockType}
                            onChange={(e) => setBlockType(e.target.value as typeof blockType)}
                            options={CONTENT_BLOCK_TYPES.map((type) => ({ value: type.value, label: type.label }))}
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

                    {blockType === 'Text' && (
                        <>
                            <FormItem top={t('htmlContent')} htmlFor="htmlContent">
                                <Textarea
                                    id="htmlContent"
                                    value={htmlContent}
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                    rows={10}
                                    placeholder={t('htmlContentPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('enableComments')}>
                                <Switch
                                    checked={enableComments}
                                    onChange={(e => setEnableComments(e.currentTarget.checked))}
                                >
                                </Switch>
                            </FormItem>
                            <FormItem top={t('enableHighlights')}>
                                <Switch
                                    checked={enableHighlights}
                                    onChange={(e) => {setEnableHighlights(e.currentTarget.checked)}}
                                >
                                </Switch>
                            </FormItem>
                        </>
                    )}

                    {blockType === 'Image' && (
                        <>
                            <FormItem top={t('imageUrl')} htmlFor="imageUrl">
                                <Input
                                    id="imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder={t('imageUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('altText')} htmlFor="altText">
                                <Input
                                    id="altText"
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                    placeholder={t('altTextPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('caption')} htmlFor="caption">
                                <Input
                                    id="caption"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder={t('captionPlaceholder')}
                                />
                            </FormItem>
                        </>
                    )}

                    {blockType === 'Video' && (
                        <>
                            <FormItem top={t('videoUrl')} htmlFor="videoUrl">
                                <Input
                                    id="videoUrl"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder={t('videoUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('thumbnailUrl')} htmlFor="thumbnailUrl">
                                <Input
                                    id="thumbnailUrl"
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                    placeholder={t('thumbnailUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('autoPlay')}>
                                <Switch checked={autoPlay}
                                        onChange={()=> setAutoPlay}>
                                    
                                </Switch>
                            </FormItem>
                            <FormItem top={t('showControls')}>
                                <Switch checked={showControls} onChange={()=>setShowControls}>
                                    
                                </Switch>
                            </FormItem>
                        </>
                    )}

                    {blockType === 'Audio' && (
                        <>
                            <FormItem top={t('audioUrl')} htmlFor="audioUrl">
                                <Input
                                    id="audioUrl"
                                    value={audioUrl}
                                    onChange={(e) => setAudioUrl(e.target.value)}
                                    placeholder={t('audioUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('showTranscript')}>
                                <Switch checked={showTranscript} onChange={()=>setShowTranscript}>
                                    
                                </Switch>
                            </FormItem>
                            {showTranscript && (
                                <FormItem top={t('transcript')} htmlFor="transcript">
                                    <Textarea
                                        id="transcript"
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        rows={5}
                                    />
                                </FormItem>
                            )}
                        </>
                    )}

                    {blockType === 'Pdf' && (
                        <>
                            <FormItem top={t('pdfUrl')} htmlFor="pdfUrl">
                                <Input
                                    id="pdfUrl"
                                    value={pdfUrl}
                                    onChange={(e) => setPdfUrl(e.target.value)}
                                    placeholder={t('pdfUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('enableDownload')}>
                                <Switch checked={enableDownload} onChange={()=>setEnableDownload}>
                                    
                                </Switch>
                            </FormItem>
                            <FormItem top={t('enableAnnotations')}>
                                <Switch checked={enableAnnotations} onChange={()=>setEnableAnnotations}>
                                    
                                </Switch>
                            </FormItem>
                        </>
                    )}

                    {blockType === 'Embedded' && (
                        <>
                            <FormItem top={t('embedUrl')} htmlFor="embedUrl">
                                <Input
                                    id="embedUrl"
                                    value={embedUrl}
                                    onChange={(e) => setEmbedUrl(e.target.value)}
                                    placeholder={t('embedUrlPlaceholder')}
                                />
                            </FormItem>
                            <FormItem top={t('dimensions')}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Input
                                        id="embedWidth"
                                        value={embedWidth}
                                        onChange={(e) => setEmbedWidth(e.target.value)}
                                        placeholder="Width"
                                        style={{ flex: 1 }}
                                    />
                                    <Input
                                        id="embedHeight"
                                        value={embedHeight}
                                        onChange={(e) => setEmbedHeight(e.target.value)}
                                        placeholder="Height"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </FormItem>
                        </>
                    )}
                </Group>

                <div style={{ padding: '16px', display: 'flex', gap: 8 }}>
                    <Button
                        size="l"
                        stretched
                        type="submit"
                        loading={createContentBlock.isPending}
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
