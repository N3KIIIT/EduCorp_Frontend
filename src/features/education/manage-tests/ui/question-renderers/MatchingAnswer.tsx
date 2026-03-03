'use client';

import React from 'react';
import { Select } from '@vkontakte/vkui';
import type { MatchingItemResponse } from '@/lib/api-client/types.gen';
import { useTranslations } from 'next-intl';
import '../test-take.css';

interface MatchingAnswerProps {
    leftItems: MatchingItemResponse[];
    rightItems: MatchingItemResponse[];
    matches: Record<string, number | string>;
    onChange: (matches: Record<string, number | string>) => void;
    disabled?: boolean;
}

export const MatchingAnswer: React.FC<MatchingAnswerProps> = ({
    leftItems,
    rightItems,
    matches,
    onChange,
    disabled,
}) => {
    const t = useTranslations('education.tests.take');

    const rightOptions = rightItems.map((item, index) => ({
        value: String(index),
        label: item.text,
    }));

    const handleMatch = (leftIndex: number, rightIndex: string) => {
        const newMatches = { ...matches };
        newMatches[String(leftIndex)] = parseInt(rightIndex, 10);
        onChange(newMatches);
    };

    return (
        <div className="answerSection">
            <div className="matchingContainer">
                {leftItems.map((leftItem, leftIndex) => (
                    <div key={leftIndex} className="matchingRow">
                        <div className="matchingLeft">{leftItem.text}</div>
                        <div className="matchingArrow">→</div>
                        <div className="matchingRight">
                            <Select
                                value={matches[String(leftIndex)] !== undefined ? String(matches[String(leftIndex)]) : ''}
                                onChange={(e) => handleMatch(leftIndex, e.target.value)}
                                options={[
                                    { value: '', label: t('selectMatch') },
                                    ...rightOptions,
                                ]}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
