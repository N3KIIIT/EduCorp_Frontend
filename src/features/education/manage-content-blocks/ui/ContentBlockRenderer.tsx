'use client';

import React from 'react';
import { Spinner } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useContentBlock } from '../api/content-block-api';
import type {
    IContentBlockDataResponseTextContentResponse,
    IContentBlockDataResponseImageContentResponse,
    IContentBlockDataResponseVideoContentResponse,
    IContentBlockDataResponseAudioContentResponse,
    IContentBlockDataResponseEmbedContentResponse,
    IContentBlockDataResponsePdfContentResponse,
    IContentBlockDataResponseSectionBreakContentResponse,
} from '@/lib/api-client/types.gen';

interface ContentBlockRendererProps {
    blockId: string;
}

function getYouTubeEmbedUrl(url: string): string | null {
    const ytMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
}

function getVimeoEmbedUrl(url: string): string | null {
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
}

function renderText(data: IContentBlockDataResponseTextContentResponse) {
    return (
        <div
            className="cbText"
            dangerouslySetInnerHTML={{ __html: data.htmlContent }}
        />
    );
}

function renderImage(data: IContentBlockDataResponseImageContentResponse) {
    return (
        <figure className="cbFigure">
            <img
                src={data.imageUrl}
                alt={data.altText ?? ''}
                className="cbImage"
                loading="lazy"
            />
            {data.caption && <figcaption className="cbCaption">{data.caption}</figcaption>}
        </figure>
    );
}

function renderVideo(data: IContentBlockDataResponseVideoContentResponse) {
    const youtubeUrl = getYouTubeEmbedUrl(data.videoUrl);
    const vimeoUrl = getVimeoEmbedUrl(data.videoUrl);

    if (youtubeUrl || vimeoUrl) {
        return (
            <div className="cbVideoWrapper">
                <iframe
                    src={youtubeUrl ?? vimeoUrl!}
                    className="cbVideoEmbed"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="video"
                />
            </div>
        );
    }

    return (
        <video
            src={data.videoUrl}
            controls={data.showControls}
            autoPlay={data.autoPlay}
            poster={data.thumbnailUrl ?? undefined}
            className="cbVideo"
        />
    );
}

function renderAudio(data: IContentBlockDataResponseAudioContentResponse) {
    return (
        <div className="cbAudio">
            {data.title && <div className="cbAudioTitle">{data.title}</div>}
            <audio controls autoPlay={data.autoPlay} className="cbAudioPlayer">
                <source src={data.audioUrl} />
            </audio>
            {data.showTranscript && data.transcript && (
                <div className="cbTranscript">{data.transcript}</div>
            )}
        </div>
    );
}

function renderEmbed(data: IContentBlockDataResponseEmbedContentResponse) {
    return (
        <div className="cbVideoWrapper">
            <iframe
                src={data.embedUrl}
                title={data.title ?? 'embedded content'}
                className="cbVideoEmbed"
                allowFullScreen
            />
        </div>
    );
}

function renderPdf(data: IContentBlockDataResponsePdfContentResponse) {
    return (
        <div className="cbPdf">
            <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer" className="cbPdfLink">
                📄 {data.pdfUrl.split('/').pop() ?? 'document.pdf'}
            </a>
            {data.enableDownload && (
                <a href={data.pdfUrl} download className="cbPdfDownload">
                    ⬇ Скачать
                </a>
            )}
        </div>
    );
}

function renderSectionBreak(data: IContentBlockDataResponseSectionBreakContentResponse) {
    return (
        <div className="cbSectionBreak">
            <div className="cbSectionLine" />
            {data.title && <div className="cbSectionTitle">{data.title}</div>}
            {data.description && <div className="cbSectionDesc">{data.description}</div>}
        </div>
    );
}

export const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ blockId }) => {
    const t = useTranslations('education.contentBlocks');
    const { data, isLoading, error } = useContentBlock(blockId);

    if (isLoading) {
        return (
            <div className="cbLoading">
                <Spinner size="m" />
            </div>
        );
    }

    if (error || !data) {
        return <div className="cbError">{t('errorLoading')}</div>;
    }

    const blockData = data.data as Record<string, unknown> & { type?: string };

    switch (blockData?.type) {
        case 'Text':
            return renderText(blockData as unknown as IContentBlockDataResponseTextContentResponse);
        case 'Image':
            return renderImage(blockData as unknown as IContentBlockDataResponseImageContentResponse);
        case 'Video':
            return renderVideo(blockData as unknown as IContentBlockDataResponseVideoContentResponse);
        case 'Audio':
            return renderAudio(blockData as unknown as IContentBlockDataResponseAudioContentResponse);
        case 'Embedded':
            return renderEmbed(blockData as unknown as IContentBlockDataResponseEmbedContentResponse);
        case 'Pdf':
            return renderPdf(blockData as unknown as IContentBlockDataResponsePdfContentResponse);
        case 'SectionBreak':
            return renderSectionBreak(blockData as unknown as IContentBlockDataResponseSectionBreakContentResponse);
        default:
            return <div className="cbUnsupported">{t('unsupportedType')}: {blockData?.type}</div>;
    }
};
