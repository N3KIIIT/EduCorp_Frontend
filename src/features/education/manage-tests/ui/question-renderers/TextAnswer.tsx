'use client';

import React from 'react';
import { Input } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';

interface TextAnswerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const TextAnswer: React.FC<TextAnswerProps> = ({ value, onChange, disabled }) => {
    const t = useTranslations('education.tests');

    return (
        <div className="answerSection">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t('answerPlaceholder')}
                disabled={disabled}
            />
        </div>
    );
};
