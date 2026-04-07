'use client';

import React, { useState, useMemo } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    SimpleCell,
    Spinner,
    Placeholder,
    Chip,
} from '@vkontakte/vkui';
import { Icon24DoneOutline, Icon24ErrorCircleOutline } from '@vkontakte/icons';
import { useTranslations } from 'next-intl';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useAppContextStore } from '@/shared/lib/navigation/appContextStore';
import { useAttemptsByTest } from '../api/attempt-api';
import { TEST_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import type { AttemptBriefResponse } from '@/lib/api-client/types.gen';
import './test-take.css';

type FilterValue = 'all' | 'passed' | 'failed' | 'inProgress';

interface AttemptsHistoryPanelProps {
    id: string;
}

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

function formatTimeSpent(timeSpent: string | null | undefined): string {
    if (!timeSpent) return '—';
    // ISO 8601: PT1M30S
    const isoMatch = timeSpent.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (isoMatch) {
        const h = parseInt(isoMatch[1] || '0', 10);
        const m = parseInt(isoMatch[2] || '0', 10);
        const s = Math.floor(parseFloat(isoMatch[3] || '0'));
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }
    // HH:MM:SS fallback
    const parts = timeSpent.split(':');
    if (parts.length === 3) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const s = parseInt(parts[2], 10);
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }
    return timeSpent;
}

export const AttemptsHistoryPanel: React.FC<AttemptsHistoryPanelProps> = ({ id }) => {
    const t = useTranslations('education.tests.attempts');
    const { goBackPanel, goToPanel } = useNavigationStore();
    const { currentTestId, setCurrentAttemptId } = useAppContextStore();

    const [filter, setFilter] = useState<FilterValue>('all');

    const attemptsQuery = useAttemptsByTest(currentTestId ?? '', 1, 50);
    const attempts: AttemptBriefResponse[] = attemptsQuery.data?.items ?? [];

    const filtered = useMemo(() => {
        if (filter === 'all') return attempts;
        if (filter === 'passed') return attempts.filter((a) => a.passed === true);
        if (filter === 'failed') return attempts.filter((a) => a.passed === false && a.status !== 'InProgress');
        if (filter === 'inProgress') return attempts.filter((a) => a.status === 'InProgress');
        return attempts;
    }, [attempts, filter]);

    const handleSelectAttempt = (attemptId: string) => {
        setCurrentAttemptId(attemptId);
        goToPanel(TEST_PANEL_IDS.ATTEMPT_REVIEW);
    };

    const filters: { value: FilterValue; label: string }[] = [
        { value: 'all', label: t('filterAll') },
        { value: 'passed', label: t('filterPassed') },
        { value: 'failed', label: t('filterFailed') },
        { value: 'inProgress', label: t('filterInProgress') },
    ];

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                {t('title')}
            </PanelHeader>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, padding: '8px 16px', flexWrap: 'wrap' }}>
                {filters.map((f) => (
                    <Chip
                        key={f.value}
                        removable={false}
                        onClick={() => setFilter(f.value)}
                        style={{
                            cursor: 'pointer',
                            opacity: filter === f.value ? 1 : 0.55,
                            fontWeight: filter === f.value ? 600 : 400,
                        }}
                    >
                        {f.label}
                    </Chip>
                ))}
            </div>

            {attemptsQuery.isLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <Spinner size="large" />
                </div>
            )}

            {attemptsQuery.error && (
                <Placeholder>{t('errorLoading')}</Placeholder>
            )}

            {!attemptsQuery.isLoading && !attemptsQuery.error && (
                <Group>
                    {filtered.length === 0 ? (
                        <Placeholder>{t('noAttempts')}</Placeholder>
                    ) : (
                        filtered.map((attempt, idx) => {
                            const isInProgress = attempt.status === 'InProgress';
                            const isPassed = attempt.passed === true;
                            const isFailed = attempt.passed === false && !isInProgress;
                            const score = attempt.score != null ? `${Number(attempt.score)}%` : null;
                            const timeSpent = attempt.timeSpent
                                ? formatTimeSpent(attempt.timeSpent)
                                : null;

                            return (
                                <SimpleCell
                                    key={attempt.id ?? idx}
                                    before={
                                        isInProgress
                                            ? (
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--vkui--color_accent_orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>…</div>
                                            ) : isPassed
                                                ? <Icon24DoneOutline fill="var(--vkui--color_accent_green)" />
                                                : <Icon24ErrorCircleOutline fill="var(--vkui--color_accent_red)" />
                                    }
                                    subtitle={
                                        [
                                            formatDate(attempt.startedAt),
                                            score ? `${t('score')}: ${score}` : null,
                                            timeSpent ? `${t('duration')}: ${timeSpent}` : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ')
                                    }
                                    onClick={() => attempt.id && handleSelectAttempt(attempt.id)}
                                    expandable="auto"
                                >
                                    {isInProgress
                                        ? t('statusInProgress')
                                        : isPassed
                                            ? t('statusPassed')
                                            : isFailed
                                                ? t('statusFailed')
                                                : t('statusUnknown')}
                                </SimpleCell>
                            );
                        })
                    )}
                </Group>
            )}
        </Panel>
    );
};
