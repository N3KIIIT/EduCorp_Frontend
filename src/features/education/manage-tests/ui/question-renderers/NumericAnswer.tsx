'use client';

import React from 'react';
import { Input } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';

interface NumericAnswerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const NumericAnswer: React.FC<NumericAnswerProps> = ({ value, onChange, disabled }) => {
    const t = useTranslations('education.tests');

    return (
        <div className="answerSection">
            <Input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={t('enterAnswer')}
                disabled={disabled}
                step="any"
            />
        </div>
    );
};
