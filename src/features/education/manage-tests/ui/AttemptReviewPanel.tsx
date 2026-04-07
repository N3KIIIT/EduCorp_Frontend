'use client';

import React from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    Spinner,
    Placeholder,
    Div,
    Caption,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { useAttemptWithAnswers, useTestWithQuestions, useAttemptResult } from '../api/attempt-api';
import type {
    QuestionResponse,
    AttemptResponse,
    IAnswerData,
    IQuestionDataResponse,
} from '@/lib/api-client/types.gen';
import './test-take.css';

interface AttemptReviewPanelProps {
    id: string;
}

function getAnswerForQuestion(attempt: AttemptResponse | undefined, questionId: string): IAnswerData | null {
    if (!attempt?.answers) return null;
    const ans = attempt.answers.find((a) => a.questionId === questionId);
    return ans?.data ?? null;
}

function getQuestionScore(attempt: AttemptResponse | undefined, questionId: string): number | null {
    if (!attempt?.answers) return null;
    const ans = attempt.answers.find((a) => a.questionId === questionId);
    if (!ans || ans.score === null || ans.score === undefined) return null;
    return Number(ans.score);
}

// ── Per-type answer renderers ─────────────────────────────────────────────────

interface ReviewRowProps {
    label: string;
    value: React.ReactNode;
    isCorrect?: boolean | null;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value, isCorrect }) => (
    <div style={{ marginBottom: 4 }}>
        <Caption
            style={{
                color: 'var(--vkui--color_text_secondary)',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                fontWeight: 600,
            }}
        >
            {label}
        </Caption>
        <div
            style={{
                marginTop: 2,
                padding: '6px 10px',
                borderRadius: 8,
                background:
                    isCorrect === true
                        ? 'rgba(76,175,80,0.10)'
                        : isCorrect === false
                            ? 'rgba(244,67,54,0.10)'
                            : 'var(--vkui--color_background_secondary)',
                border:
                    isCorrect === true
                        ? '1px solid rgba(76,175,80,0.3)'
                        : isCorrect === false
                            ? '1px solid rgba(244,67,54,0.3)'
                            : '1px solid transparent',
                fontSize: 14,
                lineHeight: 1.4,
                color: 'var(--vkui--color_text_primary)',
            }}
        >
            {value || '—'}
        </div>
    </div>
);

function renderAnswerReview(
    questionData: IQuestionDataResponse,
    answerData: IAnswerData | null,
    t: ReturnType<typeof useTranslations>,
): React.ReactNode {
    const qd = questionData as Record<string, unknown>;
    const ad = answerData as Record<string, unknown> | null;
    const type = qd?.type as string | undefined;

    if (type === 'SingleChoice') {
        const options = (qd.options as Array<{ text: string }>) ?? [];
        const correctIdx = Number(qd.correctOptionIndex);
        const submittedIdx = ad ? Number(ad.selectedOptionIndex) : null;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {options.map((opt, i) => {
                    const isSubmitted = submittedIdx === i;
                    const isCorrect = correctIdx === i;
                    return (
                        <div
                            key={i}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: isCorrect
                                    ? 'rgba(76,175,80,0.12)'
                                    : isSubmitted
                                        ? 'rgba(244,67,54,0.08)'
                                        : 'var(--vkui--color_background_secondary)',
                                border: isCorrect
                                    ? '1px solid rgba(76,175,80,0.4)'
                                    : isSubmitted
                                        ? '1px solid rgba(244,67,54,0.3)'
                                        : '1px solid transparent',
                                color: 'var(--vkui--color_text_primary)',
                            }}
                        >
                            <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700 }}>
                                {isCorrect && isSubmitted ? '✓' : isCorrect ? '✓' : isSubmitted ? '✗' : '○'}
                            </span>
                            {opt.text}
                            {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4caf50', fontWeight: 600 }}>{t('correctAnswer')}</span>}
                            {isSubmitted && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#f44336', fontWeight: 600 }}>{t('yourAnswer')}</span>}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (type === 'MultipleChoice') {
        const options = (qd.options as Array<{ text: string }>) ?? [];
        const correctIndices = new Set((qd.correctOptionIndices as Array<number | string> ?? []).map(Number));
        const submittedIndices = new Set(ad ? (ad.selectedOptionIndices as Array<number | string> ?? []).map(Number) : []);
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {options.map((opt, i) => {
                    const isCorrect = correctIndices.has(i);
                    const isSubmitted = submittedIndices.has(i);
                    return (
                        <div
                            key={i}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                background: isCorrect
                                    ? 'rgba(76,175,80,0.12)'
                                    : isSubmitted
                                        ? 'rgba(244,67,54,0.08)'
                                        : 'var(--vkui--color_background_secondary)',
                                border: isCorrect
                                    ? '1px solid rgba(76,175,80,0.4)'
                                    : isSubmitted
                                        ? '1px solid rgba(244,67,54,0.3)'
                                        : '1px solid transparent',
                                color: 'var(--vkui--color_text_primary)',
                            }}
                        >
                            <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700 }}>
                                {isCorrect && isSubmitted ? '✓' : isCorrect ? '✓' : isSubmitted ? '✗' : '□'}
                            </span>
                            {opt.text}
                            {isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#4caf50', fontWeight: 600 }}>{t('correctAnswer')}</span>}
                            {isSubmitted && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#f44336', fontWeight: 600 }}>{t('yourAnswer')}</span>}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (type === 'Text') {
        const submitted = ad ? (ad.answerText as string) : null;
        const acceptable = (qd.acceptableAnswers as { answers?: string[] })?.answers ?? [];
        return (
            <>
                <ReviewRow label={t('yourAnswer')} value={submitted} isCorrect={null} />
                {acceptable.length > 0 && (
                    <ReviewRow label={t('acceptableAnswers')} value={acceptable.join(', ')} />
                )}
            </>
        );
    }

    if (type === 'Numeric') {
        const submitted = ad ? String(ad.answerValue ?? '') : null;
        const settings = qd.settings as Record<string, unknown> | null;
        const correctValue = qd.correctAnswer
            ? String((qd.correctAnswer as Record<string, unknown>).correctValue ?? '')
            : settings
                ? String(settings.correctValue ?? '')
                : null;
        return (
            <>
                <ReviewRow label={t('yourAnswer')} value={submitted} />
                {correctValue && <ReviewRow label={t('correctAnswer')} value={correctValue} />}
            </>
        );
    }

    if (type === 'Matching') {
        const leftItems = (qd.leftItems as Array<{ text: string }>) ?? [];
        const rightItems = (qd.rightItems as Array<{ text: string }>) ?? [];
        const correctMatches = (qd.correctMatches as Record<string, number | string>) ?? {};
        const submittedMatches = ad ? (ad.matches as Record<string, number | string> ?? {}) : {};
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {leftItems.map((left, i) => {
                    const correctRightIdx = Number(correctMatches[String(i)]);
                    const submittedRightIdx = submittedMatches[String(i)] !== undefined
                        ? Number(submittedMatches[String(i)])
                        : null;
                    const isCorrect = submittedRightIdx === correctRightIdx;
                    const correctRight = rightItems[correctRightIdx]?.text ?? '—';
                    const submittedRight = submittedRightIdx !== null ? (rightItems[submittedRightIdx]?.text ?? '—') : '—';
                    return (
                        <div
                            key={i}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                background: isCorrect ? 'rgba(76,175,80,0.10)' : 'rgba(244,67,54,0.08)',
                                border: isCorrect ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(244,67,54,0.3)',
                                fontSize: 14,
                            }}
                        >
                            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--vkui--color_text_primary)' }}>
                                {left.text}
                            </div>
                            <div style={{ fontSize: 13, color: isCorrect ? '#4caf50' : '#f44336' }}>
                                {t('yourAnswer')}: {submittedRight}
                            </div>
                            {!isCorrect && (
                                <div style={{ fontSize: 13, color: '#4caf50', marginTop: 2 }}>
                                    {t('correctAnswer')}: {correctRight}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (type === 'Ordering') {
        const items = (qd.items as Array<{ text: string }>) ?? [];
        const correctOrder = (qd.correctOrder as Array<number | string> ?? []).map(Number);
        const submittedOrder = ad ? (ad.itemOrder as Array<number | string> ?? []).map(Number) : [];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--vkui--color_text_secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
                    {t('yourAnswer')}
                </div>
                {submittedOrder.map((itemIdx, pos) => {
                    const correctPos = correctOrder.indexOf(itemIdx);
                    const isCorrect = correctPos === pos;
                    return (
                        <div
                            key={pos}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 10px',
                                borderRadius: 8,
                                background: isCorrect ? 'rgba(76,175,80,0.10)' : 'rgba(244,67,54,0.08)',
                                border: isCorrect ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(244,67,54,0.3)',
                                fontSize: 14,
                                color: 'var(--vkui--color_text_primary)',
                            }}
                        >
                            <span style={{ fontWeight: 700, fontSize: 13, flexShrink: 0, color: isCorrect ? '#4caf50' : '#f44336' }}>
                                {pos + 1}.
                            </span>
                            {items[itemIdx]?.text ?? `Item ${itemIdx}`}
                        </div>
                    );
                })}
                {submittedOrder.length === 0 && items.map((item, i) => {
                    const correctPos = correctOrder.indexOf(i);
                    return (
                        <div key={i} style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--vkui--color_background_secondary)', fontSize: 14 }}>
                            {correctPos + 1}. {item.text}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (type === 'FillInTheBlank') {
        const correctAnswers = (qd.correctAnswers as Record<string, string[]>) ?? {};
        const submittedBlanks = ad ? (ad.blanks as Record<string, string> ?? {}) : {};
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(correctAnswers).map(([key, accepted]) => {
                    const submitted = submittedBlanks[key] ?? '';
                    const isCorrect = accepted.some(
                        (a) => a.toLowerCase().trim() === submitted.toLowerCase().trim(),
                    );
                    return (
                        <div
                            key={key}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 10,
                                background: isCorrect ? 'rgba(76,175,80,0.10)' : 'rgba(244,67,54,0.08)',
                                border: isCorrect ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(244,67,54,0.3)',
                                fontSize: 14,
                            }}
                        >
                            <div style={{ fontWeight: 600, color: 'var(--vkui--color_text_secondary)', marginBottom: 4, fontSize: 13 }}>
                                {`{{${key}}}`}
                            </div>
                            <div style={{ color: isCorrect ? '#4caf50' : '#f44336' }}>
                                {t('yourAnswer')}: <strong>{submitted || '—'}</strong>
                            </div>
                            {!isCorrect && (
                                <div style={{ color: '#4caf50', marginTop: 2 }}>
                                    {t('correctAnswer')}: <strong>{accepted.join(' / ')}</strong>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return <Caption style={{ color: 'var(--vkui--color_text_secondary)' }}>{t('unsupportedType')}</Caption>;
}

// ── Main Component ────────────────────────────────────────────────────────────

export const AttemptReviewPanel: React.FC<AttemptReviewPanelProps> = ({ id }) => {
    const t = useTranslations('education.tests.take');
    const tAttempts = useTranslations('education.tests.attempts');
    const { goBackPanel } = useNavigationStore();
    const { currentAttemptId, currentTestId } = useAppContextStore();

    const attemptQuery = useAttemptWithAnswers(currentAttemptId ?? '');
    const testQuery = useTestWithQuestions(currentTestId ?? '');
    const resultQuery = useAttemptResult(currentAttemptId ?? '');

    const attempt = attemptQuery.data;
    const questions: QuestionResponse[] = testQuery.data?.questions ?? [];

    const isLoading = attemptQuery.isLoading || testQuery.isLoading;

    const score = resultQuery.data?.score !== undefined
        ? Number(resultQuery.data.score)
        : attempt?.score != null
            ? Number(attempt.score)
            : null;
    const passed = attempt?.passed ?? null;

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                {tAttempts('reviewTitle')}
            </PanelHeader>

            {isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Spinner size="large" />
                </div>
            )}

            {!isLoading && (attemptQuery.error || testQuery.error) && (
                <Placeholder>{tAttempts('errorLoading')}</Placeholder>
            )}

            {!isLoading && attempt && (
                <>
                    {/* Summary header */}
                    <div
                        style={{
                            margin: '12px 16px',
                            padding: '16px',
                            borderRadius: 16,
                            background:
                                passed === true
                                    ? 'rgba(76,175,80,0.10)'
                                    : passed === false
                                        ? 'rgba(244,67,54,0.08)'
                                        : 'var(--vkui--color_background_secondary)',
                            border:
                                passed === true
                                    ? '1px solid rgba(76,175,80,0.3)'
                                    : passed === false
                                        ? '1px solid rgba(244,67,54,0.3)'
                                        : '1px solid transparent',
                            display: 'flex',
                            gap: 24,
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ fontSize: 32 }}>
                            {passed === true ? '🎉' : passed === false ? '😔' : '📊'}
                        </div>
                        <div>
                            {score !== null && (
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--vkui--color_text_primary)', fontVariantNumeric: 'tabular-nums' }}>
                                    {score}%
                                </div>
                            )}
                            <div style={{ fontSize: 14, color: 'var(--vkui--color_text_secondary)' }}>
                                {passed === true ? t('resultsPassed') : passed === false ? t('resultsFailed') : t('results')}
                            </div>
                        </div>
                    </div>

                    {/* Per-question review */}
                    <Group>
                        {questions.map((q, idx) => {
                            const qData = q.data as Record<string, unknown>;
                            const questionText = (qData?.questionText as string) || `${t('questionLabel')} ${idx + 1}`;
                            const answerData = getAnswerForQuestion(attempt, q.id);
                            const qScore = getQuestionScore(attempt, q.id);
                            const maxPoints = Number(q.points) || 0;
                            const isCorrect = qScore !== null && qScore >= maxPoints;
                            const isPartial = qScore !== null && qScore > 0 && qScore < maxPoints;
                            const isWrong = qScore !== null && qScore === 0;

                            return (
                                <Div key={q.id} style={{ paddingBottom: 0 }}>
                                    <div
                                        style={{
                                            borderRadius: 14,
                                            background: 'var(--vkui--color_background)',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                            overflow: 'hidden',
                                            marginBottom: 12,
                                        }}
                                    >
                                        {/* Question header */}
                                        <div
                                            style={{
                                                padding: '12px 16px',
                                                background:
                                                    isCorrect
                                                        ? 'rgba(76,175,80,0.08)'
                                                        : isPartial
                                                            ? 'rgba(255,152,0,0.08)'
                                                            : isWrong
                                                                ? 'rgba(244,67,54,0.08)'
                                                                : 'var(--vkui--color_background_secondary)',
                                                borderBottom: '1px solid var(--vkui--color_separator_primary)',
                                                display: 'flex',
                                                gap: 10,
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    flexShrink: 0,
                                                    color: isCorrect ? '#4caf50' : isPartial ? '#ff9800' : isWrong ? '#f44336' : 'var(--vkui--color_text_tertiary)',
                                                }}
                                            >
                                                {isCorrect ? '✓' : isPartial ? '~' : isWrong ? '✗' : '—'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: 'var(--vkui--color_text_primary)' }}>
                                                    {questionText}
                                                </div>
                                                {qScore !== null && (
                                                    <div style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary)', marginTop: 2 }}>
                                                        {qScore}/{maxPoints} {t('points')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Answer review */}
                                        <div style={{ padding: '12px 16px' }}>
                                            {renderAnswerReview(q.data, answerData, t)}
                                        </div>
                                    </div>
                                </Div>
                            );
                        })}
                    </Group>
                </>
            )}
        </Panel>
    );
};
