'use client';

import React from 'react';
import { Button, Panel, PanelHeader, PanelHeaderBack, Spinner } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import type {
    AttemptResponse,
    AttemptResultResponse,
    QuestionResponse,
} from '@/lib/api-client/types.gen';
import './test-take.css';

interface TestResultsScreenProps {
    id: string;
    attempt: AttemptResponse | undefined;
    attemptResult: AttemptResultResponse | undefined;
    questions: QuestionResponse[];
    answeredCount: number;
    onBack: () => void;
}

function formatDuration(timeSpent: string | null | undefined): string {
    if (!timeSpent) return '—';
    // ISO 8601 duration: PT1M30S or HH:MM:SS
    const isoMatch = timeSpent.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (isoMatch) {
        const h = parseInt(isoMatch[1] || '0', 10);
        const m = parseInt(isoMatch[2] || '0', 10);
        const s = Math.floor(parseFloat(isoMatch[3] || '0'));
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }
    // HH:MM:SS fallback
    const parts = timeSpent.split(':');
    if (parts.length === 3) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const s = parseInt(parts[2], 10);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }
    return timeSpent;
}

function getAnswerScore(attempt: AttemptResponse | undefined, questionId: string): number | null {
    if (!attempt?.answers) return null;
    const ans = attempt.answers.find((a) => a.questionId === questionId);
    if (!ans || ans.score === null || ans.score === undefined) return null;
    return Number(ans.score);
}

export const TestResultsScreen: React.FC<TestResultsScreenProps> = ({
    id,
    attempt,
    attemptResult,
    questions,
    answeredCount,
    onBack,
}) => {
    const tt = useTranslations('education.tests.take');

    // Score from new endpoint takes priority; fallback to AttemptResponse.score
    const score = attemptResult?.score !== undefined
        ? Number(attemptResult.score)
        : attempt?.score !== null && attempt?.score !== undefined
            ? Number(attempt.score)
            : null;

    const passed = attempt?.passed ?? null;
    const isLoading = !attempt && !attemptResult;

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
                {tt('results')}
            </PanelHeader>

            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Spinner size="large" />
                </div>
            ) : (
                <div className="resultsContainer">
                    {/* ── Main result card ── */}
                    <div className="resultsCard">
                        <div className={`resultsHeader ${passed === true ? 'resultsPassed' : passed === false ? 'resultsFailed' : ''}`}>
                            <div className="resultsEmoji">
                                <span role="img" aria-label={passed ? 'success' : 'failure'}>
                                    {passed === true ? '🎉' : passed === false ? '😔' : '📊'}
                                </span>
                            </div>
                            <div className="resultsTitle">
                                {passed === true
                                    ? tt('resultsPassed')
                                    : passed === false
                                        ? tt('resultsFailed')
                                        : tt('results')}
                            </div>
                            <div className="resultsSubtitle">
                                {passed === true
                                    ? tt('resultsPassedDesc')
                                    : passed === false
                                        ? tt('resultsFailedDesc')
                                        : ''}
                            </div>
                        </div>

                        {/* ── Stats row ── */}
                        <div className="resultsScore">
                            {score !== null && (
                                <div className="resultsStat">
                                    <div className="resultsStatValue">{score}%</div>
                                    <div className="resultsStatLabel">{tt('score')}</div>
                                </div>
                            )}
                            <div className="resultsStat">
                                <div className="resultsStatValue">
                                    {answeredCount}/{questions.length}
                                </div>
                                <div className="resultsStatLabel">{tt('answered')}</div>
                            </div>
                            {attempt?.timeSpent && (
                                <div className="resultsStat">
                                    <div className="resultsStatValue">
                                        {formatDuration(attempt.timeSpent)}
                                    </div>
                                    <div className="resultsStatLabel">{tt('timeSpent')}</div>
                                </div>
                            )}
                        </div>

                        {/* ── Per-question breakdown ── */}
                        {questions.length > 0 && attempt?.answers && attempt.answers.length > 0 && (
                            <div className="resultsBreakdown">
                                <div className="resultsBreakdownTitle">{tt('questionBreakdown')}</div>
                                {questions.map((q, idx) => {
                                    const qData = q.data as Record<string, unknown>;
                                    const text = (qData?.questionText as string) || `${tt('questionLabel')} ${idx + 1}`;
                                    const qScore = getAnswerScore(attempt, q.id);
                                    const maxPoints = Number(q.points) || 0;
                                    const isCorrect = qScore !== null && qScore >= maxPoints;
                                    const isPartial = qScore !== null && qScore > 0 && qScore < maxPoints;
                                    const isWrong = qScore !== null && qScore === 0;
                                    const notAnswered = qScore === null;

                                    return (
                                        <div
                                            key={q.id}
                                            className={`resultsQuestionRow ${
                                                isCorrect ? 'qCorrect'
                                                : isPartial ? 'qPartial'
                                                : isWrong ? 'qWrong'
                                                : 'qUnanswered'
                                            }`}
                                        >
                                            <div className="resultsQuestionStatus">
                                                {isCorrect ? '✓' : isPartial ? '~' : isWrong ? '✗' : '—'}
                                            </div>
                                            <div className="resultsQuestionText">{text}</div>
                                            <div className="resultsQuestionScore">
                                                {notAnswered
                                                    ? `0/${maxPoints}`
                                                    : `${qScore}/${maxPoints}`}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="resultsActions">
                            <Button size="l" mode="primary" stretched onClick={onBack}>
                                {tt('backToTest')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Panel>
    );
};
