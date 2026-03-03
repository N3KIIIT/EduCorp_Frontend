'use client';

import React from 'react';
import { IconButton } from '@vkontakte/vkui';
import { Icon24ChevronUp, Icon24ChevronDown } from '@vkontakte/icons';
import type { OrderingItemResponse } from '@/lib/api-client/types.gen';
import '../test-take.css';

interface OrderingAnswerProps {
    items: OrderingItemResponse[];
    itemOrder: number[];
    onChange: (order: number[]) => void;
    disabled?: boolean;
}

export const OrderingAnswer: React.FC<OrderingAnswerProps> = ({
    items,
    itemOrder,
    onChange,
    disabled,
}) => {
    const moveUp = (currentPos: number) => {
        if (currentPos <= 0 || disabled) return;
        const newOrder = [...itemOrder];
        [newOrder[currentPos - 1], newOrder[currentPos]] = [newOrder[currentPos], newOrder[currentPos - 1]];
        onChange(newOrder);
    };

    const moveDown = (currentPos: number) => {
        if (currentPos >= itemOrder.length - 1 || disabled) return;
        const newOrder = [...itemOrder];
        [newOrder[currentPos], newOrder[currentPos + 1]] = [newOrder[currentPos + 1], newOrder[currentPos]];
        onChange(newOrder);
    };

    const orderedItems = itemOrder.map((originalIndex) => ({
        item: items[originalIndex],
        originalIndex,
    }));

    return (
        <div className="answerSection">
            <div className="orderingContainer">
                {orderedItems.map(({ item, originalIndex }, displayIndex) => (
                    <div key={originalIndex} className="orderingItem">
                        <div className="orderingIndex">{displayIndex + 1}</div>
                        <div className="orderingText">{item.text}</div>
                        <div className="orderingControls">
                            <IconButton
                                onClick={() => moveUp(displayIndex)}
                                disabled={displayIndex === 0 || disabled}
                                aria-label="Move up"
                            >
                                <Icon24ChevronUp />
                            </IconButton>
                            <IconButton
                                onClick={() => moveDown(displayIndex)}
                                disabled={displayIndex === orderedItems.length - 1 || disabled}
                                aria-label="Move down"
                            >
                                <Icon24ChevronDown />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
