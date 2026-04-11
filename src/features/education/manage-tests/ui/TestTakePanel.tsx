'use client';

import React, { useState, useMemo } from 'react';
import { Alert, Panel, PanelHeader, PanelHeaderBack, Snackbar } from '@vkontakte/vkui';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { Icon24DoneOutline, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { useAttemptWithAnswers, useAttemptResult, useTestWithQuestions } from '../api/attempt-api';
import { useTestAttempt } from './hooks/useTestAttempt';
import { useTestTimer } from './hooks/useTestTimer';
import { TestStartScreen } from './TestStartScreen';
import { TestResultsScreen } from './TestResultsScreen';
import { TestQuestionScreen } from './TestQuestionScreen';
import type { QuestionResponse } from '@/lib/api-client/types.gen';
import './test-take.css';

interface TestTakePanelProps {
    id: string;
}

export const TestTakePanel: React.FC<TestTakePanelProps> = ({ id }) => {
    const t = useTranslations('education.tests');
    const { goBackPanel } = useNavigationStore();
    const { currentTestId } = useAppContextStore();

    const [snackbar, setSnackbar] = useState<React.ReactNode>(null);
    const [exitConfirm, setExitConfirm] = useState<React.ReactNode>(null);

    const handleBackWithConfirm = () => {
        setExitConfirm(
            <Alert
                actions={[
                    {
                        title: t('cancelExit'),
                        mode: 'cancel',
                        action: () => setExitConfirm(null),
                    },
                    {
                        title: t('confirmExit'),
                        mode: 'destructive',
                        action: () => { setExitConfirm(null); goBackPanel(); },
                    },
                ]}
                onClose={() => setExitConfirm(null)}
                title={t('exitTestTitle')}
                description={t('exitTestText')}
            />
        );
    };

    const testQuery = useTestWithQuestions(currentTestId ?? '');

    const test = testQuery.data;
    const questions: QuestionResponse[] = useMemo(() => test?.questions ?? [], [test]);

    const showSuccess = () =>
        setSnackbar(
            <Snackbar
                before={<Icon24DoneOutline fill="var(--vkui--color_accent_green)" />}
                onClose={() => setSnackbar(null)}
            >
                {t('testSubmitted')}
            </Snackbar>,
        );

    const showError = () =>
        setSnackbar(
            <Snackbar
                before={<Icon24ErrorCircleOutline fill="var(--vkui--color_accent_red)" />}
                onClose={() => setSnackbar(null)}
            >
                {t('submitError')}
            </Snackbar>,
        );

    const {
        currentAttemptId,
        currentQuestionIndex,
        answers,
        isCompleted,
        setAnswer,
        goToQuestion,
        startTest,
        handleNext,
        handlePrevious,
        handleComplete,
        isStarting,
        isCompleting,
    } = useTestAttempt({
        testId: currentTestId,
        questions,
        onStartError: showError,
        onCompleteError: showError,
        onCompleteSuccess: showSuccess,
    });

    // Timer: fires handleComplete when time runs out — always calls latest version via ref inside hook
    const timeLimitSeconds = test?.timeLimitSeconds ? Number(test.timeLimitSeconds) : null;
    const timerSeconds = useTestTimer(timeLimitSeconds, handleComplete, isCompleted);

    const completedAttemptId = isCompleted && currentAttemptId ? currentAttemptId : '';
    const attemptResultsQuery = useAttemptWithAnswers(completedAttemptId);
    const attemptResultQuery = useAttemptResult(completedAttemptId);

    if (testQuery.isLoading) {
        return (
            <Panel id={id}>
                <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                    {t('details')}
                </PanelHeader>
                <LoadingState variant="panel" />
            </Panel>
        );
    }

    if (isCompleted) {
        return (
            <>
                <TestResultsScreen
                    id={id}
                    attempt={attemptResultsQuery.data}
                    attemptResult={attemptResultQuery.data}
                    questions={questions}
                    answeredCount={Object.keys(answers).length}
                    onBack={goBackPanel}
                />
                {snackbar}
            </>
        );
    }

    if (!currentAttemptId && test) {
        return (
            <>
                <TestStartScreen
                    id={id}
                    test={test}
                    questionCount={questions.length}
                    onStart={startTest}
                    onBack={goBackPanel}
                    isStarting={isStarting}
                />
                {snackbar}
            </>
        );
    }

    return (
        <>
            <TestQuestionScreen
                id={id}
                testType={test?.type ?? ''}
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                timerSeconds={timerSeconds}
                onSetAnswer={setAnswer}
                onGoToQuestion={goToQuestion}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onComplete={handleComplete}
                onBack={handleBackWithConfirm}
                isCompleting={isCompleting}
            />
            {snackbar}
            {exitConfirm}
        </>
    );
};
