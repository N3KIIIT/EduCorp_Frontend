'use client';

import React from 'react';
import type { ChoiceOptionResponse } from '@/lib/api-client/types.gen';
import '../test-take.css';

interface MultipleChoiceAnswerProps {
    options: ChoiceOptionResponse[];
    selectedIndices: number[];
    onChange: (indices: number[]) => void;
    disabled?: boolean;
}

export const MultipleChoiceAnswer: React.FC<MultipleChoiceAnswerProps> = ({
    options,
    selectedIndices,
    onChange,
    disabled,
}) => {
    const toggleOption = (index: number) => {
        if (disabled) return;
        if (selectedIndices.includes(index)) {
            onChange(selectedIndices.filter((i) => i !== index));
        } else {
            onChange([...selectedIndices, index]);
        }
    };

    return (
        <div className="answerSection">
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`answerOption ${selectedIndices.includes(index) ? 'answerSelected' : ''}`}
                    onClick={() => toggleOption(index)}
                    role="checkbox"
                    aria-checked={selectedIndices.includes(index)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleOption(index)}
                >
                    <div className="answerOptionContent">
                        <div className={`answerCheckbox ${selectedIndices.includes(index) ? 'checkboxSelected' : ''}`}>
                            {selectedIndices.includes(index) && (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 7L6 10L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="answerText">{option.text}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
