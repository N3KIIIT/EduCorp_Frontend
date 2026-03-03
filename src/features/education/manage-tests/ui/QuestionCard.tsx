'use client';

import React, { useState } from 'react';
import { Button, Caption } from '@vkontakte/vkui';
import { Icon24LightbulbOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import type { QuestionResponse, IQuestionDataResponse } from '@/lib/api-client/types.gen';
import './test-take.css';

interface QuestionCardProps {
    question: QuestionResponse;
    questionIndex: number;
    totalQuestions: number;
    children: React.ReactNode;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    questionIndex,
    totalQuestions,
    children,
}) => {
    const t = useTranslations('education.tests.take');
    const [showHint, setShowHint] = useState(false);

    const data = question.data as IQuestionDataResponse & { questionText?: string; description?: string; hint?: string };
    const questionText = data?.questionText || '';
    const description = data?.description || '';
    const hint = data?.hint || '';

    return (
        <div className="questionCard questionSlideEnter">
            <div className="questionCardInner">
                <div className="questionNumber">
                    {t('questionOf', { current: questionIndex + 1, total: totalQuestions })}
                </div>
                <div className="questionText">{questionText}</div>
                {description && (
                    <div className="questionDescription">{description}</div>
                )}
                <div className="questionPointsBadge">
                    ⭐ {question.points} {t('points')}
                </div>
                {hint && (
                    <>
                        <Button
                            mode="tertiary"
                            size="s"
                            before={<Icon24LightbulbOutline />}
                            onClick={() => setShowHint(!showHint)}
                            className="hintToggle"
                        >
                            {showHint ? t('hideHint') : t('showHint')}
                        </Button>
                        {showHint && (
                            <div className="hintContent">{hint}</div>
                        )}
                    </>
                )}
            </div>
            {children}
        </div>
    );
};
