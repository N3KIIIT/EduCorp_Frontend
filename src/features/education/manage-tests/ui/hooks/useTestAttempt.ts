'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import {
    useStartAttempt,
    useSubmitAnswer,
    useCompleteAttempt,
} from '../../api/attempt-api';
import type { IAnswerDataRequest, QuestionResponse } from '@/lib/api-client/types.gen';

export type AnswerState = Record<string, IAnswerDataRequest>;

interface UseTestAttemptOptions {
    testId: string | null;
    questions: QuestionResponse[];
    onStartError: () => void;
    onCompleteError: () => void;
    onCompleteSuccess: () => void;
}

export function useTestAttempt({
    testId,
    questions,
    onStartError,
    onCompleteError,
    onCompleteSuccess,
}: UseTestAttemptOptions) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerState>({});
    const [isCompleted, setIsCompleted] = useState(false);

    const { currentAttemptId, setCurrentAttemptId } = useAppContextStore();

    // Always start fresh — clear any leftover attempt ID from a previous session
    useEffect(() => {
        setCurrentAttemptId(null);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsCompleted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testId]);

    const startAttemptMutation = useStartAttempt();
    const submitAnswerMutation = useSubmitAnswer();
    const completeAttemptMutation = useCompleteAttempt();

    // Keep callbacks in refs so they never appear as stale in memoized functions
    const onStartErrorRef = useRef(onStartError);
    const onCompleteErrorRef = useRef(onCompleteError);
    const onCompleteSuccessRef = useRef(onCompleteSuccess);
    useEffect(() => {
        onStartErrorRef.current = onStartError;
        onCompleteErrorRef.current = onCompleteError;
        onCompleteSuccessRef.current = onCompleteSuccess;
    });

    const setAnswer = useCallback((questionId: string, data: IAnswerDataRequest) => {
        setAnswers((prev) => ({ ...prev, [questionId]: data }));
    }, []);

    const submitCurrentAnswer = useCallback(
        async (questionId: string, answersSnapshot: AnswerState, attemptId: string) => {
            if (!answersSnapshot[questionId]) return;
            try {
                await submitAnswerMutation.mutateAsync({
                    attemptId,
                    questionId,
                    data: answersSnapshot[questionId],
                });
            } catch {
                // Non-fatal: continue even if single answer fails to submit
            }
        },
        [submitAnswerMutation],
    );

    const startTest = useCallback(async () => {
        if (!testId) return;
        try {
            const attemptId = await startAttemptMutation.mutateAsync({ testId });
            setCurrentAttemptId(attemptId);
        } catch {
            onStartErrorRef.current();
        }
    }, [testId, startAttemptMutation, setCurrentAttemptId]);

    // handleComplete reads fresh state via closure deps — timer calls it via ref, so no stale closure
    const handleComplete = useCallback(async () => {
        if (!currentAttemptId) return;
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && answers[currentQuestion.id]) {
            await submitCurrentAnswer(currentQuestion.id, answers, currentAttemptId);
        }
        try {
            await completeAttemptMutation.mutateAsync(currentAttemptId);
            setIsCompleted(true);
            onCompleteSuccessRef.current();
        } catch {
            onCompleteErrorRef.current();
        }
    }, [
        currentAttemptId,
        questions,
        currentQuestionIndex,
        answers,
        submitCurrentAnswer,
        completeAttemptMutation,
    ]);

    const handleNext = useCallback(async () => {
        if (currentAttemptId) {
            const currentQuestion = questions[currentQuestionIndex];
            if (currentQuestion && answers[currentQuestion.id]) {
                await submitCurrentAnswer(currentQuestion.id, answers, currentAttemptId);
            }
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    }, [questions, currentQuestionIndex, answers, currentAttemptId, submitCurrentAnswer]);

    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    }, [currentQuestionIndex]);

    const goToQuestion = useCallback((index: number) => {
        setCurrentQuestionIndex(index);
    }, []);

    return {
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
        isStarting: startAttemptMutation.isPending,
        isCompleting: completeAttemptMutation.isPending,
    };
}
