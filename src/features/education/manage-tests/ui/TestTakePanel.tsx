'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Button,
    Group,
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Spinner,
    Title,
    Caption,
    Snackbar, Box,
} from '@vkontakte/vkui';
import { Icon24DoneOutline, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import {
    useStartAttempt,
    useSubmitAnswer,
    useCompleteAttempt,
    useAttemptWithAnswers,
    useTestWithQuestions,
    useActiveAttempt,
} from '../api/attempt-api';
import type {
    IAnswerDataRequest,
    QuestionResponse,
    IQuestionDataResponse,
    ChoiceOptionResponse,
    MatchingItemResponse,
    OrderingItemResponse,
} from '@/lib/api-client/types.gen';
import { QuestionCard } from './QuestionCard';
import {
    SingleChoiceAnswer,
    MultipleChoiceAnswer,
    TextAnswer,
    NumericAnswer,
    MatchingAnswer,
    OrderingAnswer,
    FillInTheBlankAnswer,
} from './question-renderers';
import './test-take.css';

interface TestTakePanelProps {
    id: string;
}

type AnswerState = Record<string, IAnswerDataRequest>;

export const TestTakePanel: React.FC<TestTakePanelProps> = ({ id }) => {
    const t = useTranslations('education.tests');
    const tt = useTranslations('education.tests.take');
    const { goBackPanel } = useNavigationStore();
    const { currentTestId, currentAttemptId, setCurrentAttemptId } = useAppContextStore();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
    const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

    const testQuery = useTestWithQuestions(currentTestId || '');
    const activeAttemptQuery = useActiveAttempt(currentTestId || '');
    const startAttempt = useStartAttempt();
    const submitAnswer = useSubmitAnswer();
    const completeAttempt = useCompleteAttempt();
    const attemptResultsQuery = useAttemptWithAnswers(isCompleted && currentAttemptId ? currentAttemptId : '');

    const test = testQuery.data;
    const questions: QuestionResponse[] = useMemo(() => {
        if (!test) return [];
        // Cast to access questions array from TestResponse
        const testData = test as unknown as { questions?: QuestionResponse[] };
        return testData.questions || [];
    }, [test]);

    useEffect(() => {
        const testData = test as unknown as { timeLimitSeconds?: number | string | null };
        if (testData?.timeLimitSeconds && !isCompleted) {
            setTimerSeconds(Number(testData.timeLimitSeconds));
        }
    }, [test, isCompleted]);

    // Timer countdown
    useEffect(() => {
        if (timerSeconds === null || timerSeconds <= 0 || isCompleted) return;
        const interval = setInterval(() => {
            setTimerSeconds((prev) => {
                if (prev === null || prev <= 1) {
                    handleComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerSeconds, isCompleted]);

    useEffect(() => {
        const attemptData = activeAttemptQuery.data as unknown as { id?: string } | null;
        if (attemptData?.id) {
            setCurrentAttemptId(attemptData.id);
        }
    }, [activeAttemptQuery.data]);

    const handleStartTest = async () => {
        if (!currentTestId) return;
        try {
            const attemptId = await startAttempt.mutateAsync({ testId: currentTestId });
            setCurrentAttemptId(attemptId);
        } catch (error) {
            setSnackbar(
                <Snackbar
                    before={<Icon24ErrorCircleOutline fill="var(--vkui--color_accent_red)" />}
                    onClose={() => setSnackbar(null)}
                >
                    {t('submitError')}
                </Snackbar>
            );
        }
    };

    const setAnswer = useCallback((questionId: string, data: IAnswerDataRequest) => {
        setAnswers((prev) => ({ ...prev, [questionId]: data }));
    }, []);

    const handleSubmitAnswer = async (questionId: string) => {
        if (!currentAttemptId || !answers[questionId]) return;
        try {
            await submitAnswer.mutateAsync({
                attemptId: currentAttemptId,
                questionId,
                data: answers[questionId],
            });
        } catch (error) {
            console.error('Failed to submit answer:', error);
        }
    };

    const handleNext = async () => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && answers[currentQuestion.id]) {
            await handleSubmitAnswer(currentQuestion.id);
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleComplete = async () => {
        if (!currentAttemptId) return;
        // Submit current answer first
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && answers[currentQuestion.id]) {
            await handleSubmitAnswer(currentQuestion.id);
        }
        try {
            await completeAttempt.mutateAsync(currentAttemptId);
            setIsCompleted(true);
            setSnackbar(
                <Snackbar
                    before={<Icon24DoneOutline fill="var(--vkui--color_accent_green)" />}
                    onClose={() => setSnackbar(null)}
                >
                    {t('testSubmitted')}
                </Snackbar>
            );
        } catch (error) {
            setSnackbar(
                <Snackbar
                    before={<Icon24ErrorCircleOutline fill="var(--vkui--color_accent_red)" />}
                    onClose={() => setSnackbar(null)}
                >
                    {t('submitError')}
                </Snackbar>
            );
        }
    };

    const answeredCount = Object.keys(answers).length;
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    const formatTime = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getTimerClass = (): string => {
        if (timerSeconds === null) return 'timerBadge';
        if (timerSeconds <= 60) return 'timerBadge timerDanger';
        if (timerSeconds <= 300) return 'timerBadge timerWarning';
        return 'timerBadge';
    };

    const renderAnswerInput = (question: QuestionResponse) => {
        const data = question.data as any;
        const questionId = question.id;

        switch (data?.type) {
            case 'SingleChoice': {
                const options: ChoiceOptionResponse[] = data.options || [];
                const currentAnswer = answers[questionId] as any;
                return (
                    <SingleChoiceAnswer
                        options={options}
                        selectedIndex={currentAnswer?.selectedOptionIndex ?? null}
                        onChange={(index) =>
                            setAnswer(questionId, {
                                type: 'SingleChoice',
                                selectedOptionIndex: index,
                            })
                        }
                    />
                );
            }
            case 'MultipleChoice': {
                const options: ChoiceOptionResponse[] = data.options || [];
                const currentAnswer = answers[questionId] as any;
                return (
                    <MultipleChoiceAnswer
                        options={options}
                        selectedIndices={currentAnswer?.selectedOptionIndices || []}
                        onChange={(indices) =>
                            setAnswer(questionId, {
                                type: 'MultipleChoice',
                                selectedOptionIndices: indices,
                            })
                        }
                    />
                );
            }
            case 'Text': {
                const currentAnswer = answers[questionId] as any;
                return (
                    <TextAnswer
                        value={currentAnswer?.answerText || ''}
                        onChange={(value) =>
                            setAnswer(questionId, {
                                type: 'Text',
                                answerText: value,
                            })
                        }
                    />
                );
            }
            case 'Numeric': {
                const currentAnswer = answers[questionId] as any;
                return (
                    <NumericAnswer
                        value={currentAnswer?.answerValue?.toString() || ''}
                        onChange={(value) =>
                            setAnswer(questionId, {
                                type: 'Numeric',
                                answerValue: parseFloat(value) || 0,
                            })
                        }
                    />
                );
            }
            case 'Matching': {
                const leftItems: MatchingItemResponse[] = data.leftItems || [];
                const rightItems: MatchingItemResponse[] = data.rightItems || [];
                const currentAnswer = answers[questionId] as any;
                return (
                    <MatchingAnswer
                        leftItems={leftItems}
                        rightItems={rightItems}
                        matches={currentAnswer?.matches || {}}
                        onChange={(matches) =>
                            setAnswer(questionId, {
                                type: 'Matching',
                                matches,
                            })
                        }
                    />
                );
            }
            case 'Ordering': {
                const items: OrderingItemResponse[] = data.items || [];
                const currentAnswer = answers[questionId] as any;
                const defaultOrder = items.map((_, i) => i);
                return (
                    <OrderingAnswer
                        items={items}
                        itemOrder={currentAnswer?.itemOrder || defaultOrder}
                        onChange={(order) =>
                            setAnswer(questionId, {
                                type: 'Ordering',
                                itemOrder: order,
                            })
                        }
                    />
                );
            }
            case 'FillInTheBlank': {
                const correctAnswers = data.correctAnswers || {};
                const blankKeys = Object.keys(correctAnswers);
                const currentAnswer = answers[questionId] as any;
                return (
                    <FillInTheBlankAnswer
                        blankKeys={blankKeys}
                        blanks={currentAnswer?.blanks || {}}
                        onChange={(blanks) =>
                            setAnswer(questionId, {
                                type: 'FillInTheBlank',
                                blanks,
                            })
                        }
                    />
                );
            }
            default:
                return <Caption>{tt('unsupportedType')}</Caption>;
        }
    };

    // --- Loading state ---
    if (testQuery.isLoading || activeAttemptQuery.isLoading) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {t('takeTestTab')}
                </PanelHeader>
                <Box style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Spinner size="m" />
                </Box>
            </Panel>
        );
    }

    // --- No attempt started yet ---
    if (!currentAttemptId) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {t('takeTestTab')}
                </PanelHeader>
                {test && (() => {
                    const testData = test as unknown as {
                        type?: string;
                        passingScore?: number | string | null;
                        timeLimitSeconds?: number | string | null;
                    };
                    return (
                        <div className="testInfoHeader">
                            <div className="testInfoHeaderTitle">
                                {testData.type === 'Practice' ? '📝' : '📋'} {t(`testType.${testData.type}`)}
                            </div>
                            <div className="testInfoHeaderMeta">
                                {testData.passingScore && (
                                    <span className="metaBadge">
                                        🎯 {t('passingScore')}: {testData.passingScore}%
                                    </span>
                                )}
                                {testData.timeLimitSeconds && (
                                    <span className="metaBadge">
                                        ⏱ {Math.floor(Number(testData.timeLimitSeconds) / 60)} {t('minutes')}
                                    </span>
                                )}
                                <span className="metaBadge">
                                    📊 {questions.length} {t('questions')}
                                </span>
                            </div>
                        </div>
                    );
                })()}
                <Group>
                    <Box style={{ padding: '24px 16px' }}>
                        <Title level="2" style={{ marginBottom: 8 }}>{t('takeTestInstructions')}</Title>
                        <Caption style={{ marginBottom: 20 }}>{t('takeTestDescription')}</Caption>
                        <Button
                            size="l"
                            mode="primary"
                            stretched
                            onClick={handleStartTest}
                            loading={startAttempt.isPending}
                        >
                            {t('startTest')}
                        </Button>
                    </Box>
                </Group>
                {snackbar}
            </Panel>
        );
    }

    // --- Results screen ---
    if (isCompleted) {
        const result = attemptResultsQuery.data as unknown as {
            score?: number | string | null;
            passed?: boolean | null;
            timeSpent?: string | null;
        } | undefined;
        const score = result?.score ? Number(result.score) : 0;
        const passed = result?.passed ?? false;

        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {tt('results')}
                </PanelHeader>
                <div className="resultsContainer">
                    <div className="resultsCard">
                        <div className={`resultsHeader ${passed ? 'resultsPassed' : 'resultsFailed'}`}>
                            <div className="resultsEmoji">{passed ? '🎉' : '😔'}</div>
                            <div className="resultsTitle">
                                {passed ? tt('resultsPassed') : tt('resultsFailed')}
                            </div>
                            <div className="resultsSubtitle">
                                {passed ? tt('resultsPassedDesc') : tt('resultsFailedDesc')}
                            </div>
                        </div>
                        <div className="resultsScore">
                            <div className="resultsStat">
                                <div className="resultsStatValue">{score}%</div>
                                <div className="resultsStatLabel">{tt('score')}</div>
                            </div>
                            <div className="resultsStat">
                                <div className="resultsStatValue">{answeredCount}/{questions.length}</div>
                                <div className="resultsStatLabel">{tt('answered')}</div>
                            </div>
                            {result?.timeSpent && (
                                <div className="resultsStat">
                                    <div className="resultsStatValue">{result.timeSpent}</div>
                                    <div className="resultsStatLabel">{tt('timeSpent')}</div>
                                </div>
                            )}
                        </div>
                        <div className="resultsActions">
                            <Button
                                size="l"
                                mode="primary"
                                stretched
                                onClick={goBackPanel}
                            >
                                {tt('backToTest')}
                            </Button>
                        </div>
                    </div>
                </div>
                {snackbar}
            </Panel>
        );
    }

    // --- In-progress: Question view ---
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                {t('takeTestTab')}
            </PanelHeader>

            {/* Timer */}
            {timerSeconds !== null && (
                <div className={getTimerClass()}>
                    ⏱ {formatTime(timerSeconds)}
                </div>
            )}

            {/* Progress */}
            <div className="progressContainer">
                <div className="progressText">
                    <span>{tt('progress')}</span>
                    <span>{answeredCount} / {questions.length}</span>
                </div>
                <div className="progressBar">
                    <div className="progressFill" style={{ width: `${progressPercent}%` }} />
                </div>
            </div>

            {/* Question navigation pills */}
            <div className="questionNav">
                {questions.map((q, i) => {
                    let pillClass = 'questionPill';
                    if (i === currentQuestionIndex) pillClass += ' pillCurrent';
                    else if (answers[q.id]) pillClass += ' pillAnswered';
                    return (
                        <div
                            key={q.id}
                            className={pillClass}
                            onClick={() => setCurrentQuestionIndex(i)}
                        >
                            {i + 1}
                        </div>
                    );
                })}
            </div>

            {/* Current question */}
            {currentQuestion && (
                <QuestionCard
                    question={currentQuestion}
                    questionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                >
                    {renderAnswerInput(currentQuestion)}
                </QuestionCard>
            )}

            {/* Bottom navigation */}
            <div className="bottomNav">
                <Button
                    size="l"
                    mode="secondary"
                    stretched
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    {t('previous')}
                </Button>
                {isLastQuestion ? (
                    <Button
                        size="l"
                        mode="primary"
                        stretched
                        onClick={handleComplete}
                        loading={completeAttempt.isPending}
                    >
                        {t('submitTest')}
                    </Button>
                ) : (
                    <Button
                        size="l"
                        mode="primary"
                        stretched
                        onClick={handleNext}
                    >
                        {t('next')}
                    </Button>
                )}
            </div>

            {snackbar}
        </Panel>
    );
};
