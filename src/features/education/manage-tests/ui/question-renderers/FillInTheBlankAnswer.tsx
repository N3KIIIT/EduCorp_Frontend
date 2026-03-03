'use client';

import React from 'react';
import { Input } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import '../test-take.css';

interface FillInTheBlankAnswerProps {
    blankKeys: string[];
    blanks: Record<string, string>;
    onChange: (blanks: Record<string, string>) => void;
    disabled?: boolean;
}

export const FillInTheBlankAnswer: React.FC<FillInTheBlankAnswerProps> = ({
    blankKeys,
    blanks,
    onChange,
    disabled,
}) => {
    const t = useTranslations('education.tests.take');

    const handleBlankChange = (key: string, value: string) => {
        onChange({ ...blanks, [key]: value });
    };

    return (
        <div className="answerSection">
            <div className="fillBlankContainer">
                {blankKeys.map((key) => (
                    <div key={key} className="fillBlankItem">
                        <span className="fillBlankLabel">{key}</span>
                        <Input
                            value={blanks[key] || ''}
                            onChange={(e) => handleBlankChange(key, e.target.value)}
                            placeholder={t('fillBlankPlaceholder')}
                            disabled={disabled}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
