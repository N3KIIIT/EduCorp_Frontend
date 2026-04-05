'use client';

import React from 'react';
import { Caption } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import type {
    QuestionResponse,
    IAnswerDataRequest,
    ChoiceOptionResponse,
    MatchingItemResponse,
    OrderingItemResponse,
} from '@/lib/api-client/types.gen';
import {
    SingleChoiceAnswer,
    MultipleChoiceAnswer,
    TextAnswer,
    NumericAnswer,
    MatchingAnswer,
    OrderingAnswer,
    FillInTheBlankAnswer,
} from './question-renderers';

interface QuestionAnswerRendererProps {
    question: QuestionResponse;
    answer: IAnswerDataRequest | undefined;
    onSetAnswer: (data: IAnswerDataRequest) => void;
}

export const QuestionAnswerRenderer: React.FC<QuestionAnswerRendererProps> = ({
    question,
    answer,
    onSetAnswer,
}) => {
    const tt = useTranslations('education.tests.take');
    const data = question.data as Record<string, unknown>;
    const type = data?.type as string | undefined;

    switch (type) {
        case 'SingleChoice': {
            const options = (data.options as ChoiceOptionResponse[]) ?? [];
            const current = answer as { selectedOptionIndex?: number | null } | undefined;
            return (
                <SingleChoiceAnswer
                    options={options}
                    selectedIndex={current?.selectedOptionIndex ?? null}
                    onChange={(index) =>
                        onSetAnswer({ type: 'SingleChoice', selectedOptionIndex: index })
                    }
                />
            );
        }

        case 'MultipleChoice': {
            const options = (data.options as ChoiceOptionResponse[]) ?? [];
            const current = answer as { selectedOptionIndices?: number[] } | undefined;
            return (
                <MultipleChoiceAnswer
                    options={options}
                    selectedIndices={current?.selectedOptionIndices ?? []}
                    onChange={(indices) =>
                        onSetAnswer({ type: 'MultipleChoice', selectedOptionIndices: indices })
                    }
                />
            );
        }

        case 'Text': {
            const current = answer as { answerText?: string } | undefined;
            return (
                <TextAnswer
                    value={current?.answerText ?? ''}
                    onChange={(value) => onSetAnswer({ type: 'Text', answerText: value })}
                />
            );
        }

        case 'Numeric': {
            const current = answer as { answerValue?: number } | undefined;
            return (
                <NumericAnswer
                    value={current?.answerValue?.toString() ?? ''}
                    onChange={(value) =>
                        onSetAnswer({ type: 'Numeric', answerValue: parseFloat(value) || 0 })
                    }
                />
            );
        }

        case 'Matching': {
            const leftItems = (data.leftItems as MatchingItemResponse[]) ?? [];
            const rightItems = (data.rightItems as MatchingItemResponse[]) ?? [];
            const current = answer as { matches?: Record<string, string> } | undefined;
            return (
                <MatchingAnswer
                    leftItems={leftItems}
                    rightItems={rightItems}
                    matches={current?.matches ?? {}}
                    onChange={(matches) => onSetAnswer({ type: 'Matching', matches })}
                />
            );
        }

        case 'Ordering': {
            const items = (data.items as OrderingItemResponse[]) ?? [];
            const current = answer as { itemOrder?: number[] } | undefined;
            const defaultOrder = items.map((_, i) => i);
            return (
                <OrderingAnswer
                    items={items}
                    itemOrder={current?.itemOrder ?? defaultOrder}
                    onChange={(order) => onSetAnswer({ type: 'Ordering', itemOrder: order })}
                />
            );
        }

        case 'FillInTheBlank': {
            const correctAnswers = (data.correctAnswers as Record<string, unknown>) ?? {};
            const blankKeys = Object.keys(correctAnswers);
            const current = answer as { blanks?: Record<string, string> } | undefined;
            return (
                <FillInTheBlankAnswer
                    blankKeys={blankKeys}
                    blanks={current?.blanks ?? {}}
                    onChange={(blanks) => onSetAnswer({ type: 'FillInTheBlank', blanks })}
                />
            );
        }

        default:
            return <Caption>{tt('unsupportedType')}</Caption>;
    }
};
