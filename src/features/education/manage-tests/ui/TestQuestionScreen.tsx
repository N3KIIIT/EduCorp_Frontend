'use client';

import React from 'react';
import {
    Button,
    Panel,
    PanelHeader,
    PanelHeaderBack,
} from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import { classNames } from '@/css/classnames';
import type { IAnswerDataRequest, QuestionResponse } from '@/lib/api-client/types.gen';
import { QuestionCard } from './QuestionCard';
import { QuestionAnswerRenderer } from './QuestionAnswerRenderer';

interface TestQuestionScreenProps {
    id: string;
    questions: QuestionResponse[];
    currentQuestionIndex: number;
    answers: Record<string, IAnswerDataRequest>;
    timerSeconds: number | null;
    onSetAnswer: (questionId: string, data: IAnswerDataRequest) => void;
    onGoToQuestion: (index: number) => void;
    onNext: () => Promise<void>;
    onPrevious: () => void;
    onComplete: () => Promise<void>;
    onBack: () => void;
    isCompleting: boolean;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getTimerClass(seconds: number | null): string {
    if (seconds === null) return 'timerBadge';
    if (seconds <= 60) return 'timerBadge timerDanger';
    if (seconds <= 300) return 'timerBadge timerWarning';
    return 'timerBadge';
}

export const TestQuestionScreen: React.FC<TestQuestionScreenProps> = ({
    id,
    questions,
    currentQuestionIndex,
    answers,
    timerSeconds,
    onSetAnswer,
    onGoToQuestion,
    onNext,
    onPrevious,
    onComplete,
    onBack,
    isCompleting,
}) => {
    const t = useTranslations('education.tests');
    const tt = useTranslations('education.tests.take');

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const answeredCount = Object.keys(answers).length;
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
                {t('takeTestTab')}
            </PanelHeader>

            {timerSeconds !== null && (
                <div className={getTimerClass(timerSeconds)}>
                    <span role="img" aria-label="timer">⏱</span> {formatTime(timerSeconds)}
                </div>
            )}

            <div className="progressContainer">
                <div className="progressText">
                    <span>{tt('progress')}</span>
                    <span>{answeredCount} / {questions.length}</span>
                </div>
                <div className="progressBar">
                    <div className="progressFill" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            <div className="questionNav">
                {questions.map((q, i) => (
                    <div
                        key={q.id}
                        className={classNames('questionPill', {
                            pillCurrent: i === currentQuestionIndex,
                            pillAnswered: i !== currentQuestionIndex && !!answers[q.id],
                        })}
                        onClick={() => onGoToQuestion(i)}
                    >
                        {i + 1}
                    </div>
                ))}
            </div>

            {currentQuestion && (
                <QuestionCard
                    question={currentQuestion}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                >
                    <QuestionAnswerRenderer
                        question={currentQuestion}
                        answer={answers[currentQuestion.id]}
                        onSetAnswer={(data) => onSetAnswer(currentQuestion.id, data)}
                    />
                </QuestionCard>
            )}

            <div className="bottomNav">
                <Button
                    size="l"
                    mode="secondary"
                    stretched
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    {t('previous')}
                </Button>
                {isLastQuestion ? (
                    <Button
                        size="l"
                        mode="primary"
                        stretched
                        onClick={onComplete}
                        loading={isCompleting}
                    >
                        {t('submitTest')}
                    </Button>
                ) : (
                    <Button size="l" mode="primary" stretched onClick={onNext}>
                        {t('next')}
                    </Button>
                )}
            </div>
        </Panel>
    );
};
