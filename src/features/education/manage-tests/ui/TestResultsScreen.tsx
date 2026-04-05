'use client';

import React from 'react';
import { Button, Panel, PanelHeader, PanelHeaderBack } from '@vkontakte/vkui';
import { useTranslations } from 'next-intl';
import type { AttemptResponse } from '@/lib/api-client/types.gen';

interface TestResultsScreenProps {
    id: string;
    result: AttemptResponse | undefined;
    answeredCount: number;
    totalQuestions: number;
    onBack: () => void;
}

export const TestResultsScreen: React.FC<TestResultsScreenProps> = ({
    id,
    result,
    answeredCount,
    totalQuestions,
    onBack,
}) => {
    const tt = useTranslations('education.tests.take');

    const score = result?.score ? Number(result.score) : 0;
    const passed = result?.passed ?? false;

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={onBack} />}>
                {tt('results')}
            </PanelHeader>

            <div className="resultsContainer">
                <div className="resultsCard">
                    <div className={`resultsHeader ${passed ? 'resultsPassed' : 'resultsFailed'}`}>
                        <div className="resultsEmoji">
                            <span role="img" aria-label={passed ? 'success' : 'failure'}>
                                {passed ? '🎉' : '😔'}
                            </span>
                        </div>
                        <div className="resultsTitle">
                            {passed ? tt('resultsPassed') : tt('resultsFailed')}
                        </div>
                        <div className="resultsSubtitle">
                            {passed ? tt('resultsPassedDesc') : tt('resultsFailedDesc')}
                        </div>
                    </div>

                    <div className="resultsScore">
                        <div className="resultsStat">
                            <div className="resultsStatValue">{score}%</div>
                            <div className="resultsStatLabel">{tt('score')}</div>
                        </div>
                        <div className="resultsStat">
                            <div className="resultsStatValue">
                                {answeredCount}/{totalQuestions}
                            </div>
                            <div className="resultsStatLabel">{tt('answered')}</div>
                        </div>
                        {result?.timeSpent && (
                            <div className="resultsStat">
                                <div className="resultsStatValue">{result.timeSpent}</div>
                                <div className="resultsStatLabel">{tt('timeSpent')}</div>
                            </div>
                        )}
                    </div>

                    <div className="resultsActions">
                        <Button size="l" mode="primary" stretched onClick={onBack}>
                            {tt('backToTest')}
                        </Button>
                    </div>
                </div>
            </div>
        </Panel>
    );
};
