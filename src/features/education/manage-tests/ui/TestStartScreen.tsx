'use client';

import React from 'react';
import { Button, Group, Panel, PanelHeader, PanelHeaderBack, Title, Caption, Box } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import type { TestResponse } from '@/lib/api-client/types.gen';

interface TestStartScreenProps {
    id: string;
    test: TestResponse;
    questionCount: number;
    onStart: () => void;
    onBack: () => void;
    isStarting: boolean;
}

export const TestStartScreen: React.FC<TestStartScreenProps> = ({
    id,
    test,
    questionCount,
    onStart,
    onBack,
    isStarting,
}) => {
    const t = useTranslations('education.tests');

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
                {t(`testType.${test.type}`)}
            </PanelHeader>

            <div className="testInfoHeader">
                <div className="testInfoHeaderTitle">
                    <span role="img" aria-label={test.type}>
                        {test.type === 'Practice' ? '📝' : '📋'}
                    </span>{' '}
                    {t(`testType.${test.type}`)}
                </div>
                <div className="testInfoHeaderMeta">
                    {test.passingScore && (
                        <span className="metaBadge">
                            <span role="img" aria-label="passing score">🎯</span>{' '}
                            {t('passingScore')}: {test.passingScore}%
                        </span>
                    )}
                    {test.timeLimitSeconds && (
                        <span className="metaBadge">
                            <span role="img" aria-label="time limit">⏱</span>{' '}
                            {Math.floor(Number(test.timeLimitSeconds) / 60)} {t('minutes')}
                        </span>
                    )}
                    <span className="metaBadge">
                        <span role="img" aria-label="questions">📊</span>{' '}
                        {questionCount} {t('questions')}
                    </span>
                </div>
            </div>

            <Group>
                <Box style={{ padding: '24px 16px' }}>
                    <Title level="2" style={{ marginBottom: 8 }}>
                        {t('takeTestInstructions')}
                    </Title>
                    <Caption style={{ marginBottom: 20 }}>
                        {t('takeTestDescription')}
                    </Caption>
                    <Button size="l" mode="primary" stretched onClick={onStart} loading={isStarting}>
                        {t('startTest')}
                    </Button>
                </Box>
            </Group>
        </Panel>
    );
};
