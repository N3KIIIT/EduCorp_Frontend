'use client';

import React from 'react';
import type { ChoiceOptionResponse } from '@/lib/api-client/types.gen';
import '../test-take.css';

interface SingleChoiceAnswerProps {
    options: ChoiceOptionResponse[];
    selectedIndex: number | null;
    onChange: (index: number) => void;
    disabled?: boolean;
}

export const SingleChoiceAnswer: React.FC<SingleChoiceAnswerProps> = ({
    options,
    selectedIndex,
    onChange,
    disabled,
}) => {
    return (
        <div className="answerSection">
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`answerOption ${selectedIndex === index ? 'answerSelected' : ''}`}
                    onClick={() => !disabled && onChange(index)}
                    role="radio"
                    aria-checked={selectedIndex === index}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && !disabled && onChange(index)}
                >
                    <div className="answerOptionContent">
                        <div className={`answerRadio ${selectedIndex === index ? 'radioSelected' : ''}`} />
                        <span className="answerText">{option.text}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
