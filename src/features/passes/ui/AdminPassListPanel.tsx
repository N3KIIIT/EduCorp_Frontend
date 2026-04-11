'use client';

import React, { useState } from 'react';
import {
    Panel,
    PanelHeader,
    PanelHeaderBack,
    Group,
    Div,
    Button,
    Spinner,
    Avatar,
} from '@vkontakte/vkui';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { PermissionGuard } from '@/features/education/ui/PermissionGuard';
import { ROLES } from '@/entities/session';
import { PASS_PANEL_IDS } from '@/shared/config/navigation/panel-ids';
import {
    usePasses,
    useSuspendPass,
    useReinstatePass,
    useRevokePass,
} from '../api/pass-api';
import type { PassBriefResponse, PassStatus } from '../types';
import '@/features/passes/passes.css';

interface AdminPassListPanelProps {
    id: string;
}

type FilterStatus = 'All' | PassStatus;

function getStatusLabel(status: PassStatus): string {
    switch (status) {
        case 'Active': return 'Активен';
        case 'Suspended': return 'Приостановлен';
        case 'Revoked': return 'Отозван';
        case 'Expired': return 'Истёк';
        default: return status;
    }
}

export const AdminPassListPanel: React.FC<AdminPassListPanelProps> = ({ id }) => {
    const { goBackPanel, goToPanel } = useNavigationStore();
    const [filter, setFilter] = useState<FilterStatus>('All');

    const { data: passesData, isLoading } = usePasses({ page: 1, pageSize: 50 });
    const suspendPass = useSuspendPass();
    const reinstatePass = useReinstatePass();
    const revokePass = useRevokePass();

    const passes = passesData?.items ?? [];

    const filteredPasses = filter === 'All'
        ? passes
        : passes.filter((p) => p.status === filter);

    const handleSuspend = (pass: PassBriefResponse) => {
        const reason = window.prompt(`Причина приостановки пропуска для ${pass.userName ?? pass.userId}:`);
        if (reason === null) return;
        suspendPass.mutate({ id: pass.id, reason: reason.trim() || 'Без причины' });
    };

    const handleReinstate = (pass: PassBriefResponse) => {
        reinstatePass.mutate(pass.id);
    };

    const handleRevoke = (pass: PassBriefResponse) => {
        const confirmed = window.confirm(`Отозвать пропуск для ${pass.userName ?? pass.userId}? Это действие необратимо.`);
        if (!confirmed) return;
        revokePass.mutate(pass.id);
    };

    const filterOptions: { label: string; value: FilterStatus }[] = [
        { label: 'Все', value: 'All' },
        { label: 'Активные', value: 'Active' },
        { label: 'Приостановленные', value: 'Suspended' },
        { label: 'Отозванные', value: 'Revoked' },
    ];

    return (
        <Panel id={id}>
            <PanelHeader
                before={<PanelHeaderBack onClick={goBackPanel} />}
                after={
                    <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                        <Button
                            size="s"
                            mode="tertiary"
                            onClick={() => goToPanel(PASS_PANEL_IDS.SCAN)}
                        >
                            Сканер
                        </Button>
                    </PermissionGuard>
                }
            >
                Управление пропусками
            </PanelHeader>

            <Group>
                <Div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 0 }}>
                    {filterOptions.map((option) => (
                        <Button
                            key={option.value}
                            size="s"
                            mode={filter === option.value ? 'primary' : 'secondary'}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </Div>

                {isLoading && (
                    <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                        <Spinner size="medium" />
                    </Div>
                )}

                {!isLoading && filteredPasses.length === 0 && (
                    <Div style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)', padding: 32 }}>
                        Пропуска не найдены
                    </Div>
                )}

                {filteredPasses.map((pass) => (
                    <div key={pass.id} className="passListItem">
                        <Avatar size={40}>
                            {(pass.userName ?? pass.userId).charAt(0).toUpperCase()}
                        </Avatar>

                        <div className="passListItemInfo">
                            <div className="passListItemName">
                                {pass.userName ?? pass.userId}
                            </div>
                            {pass.department && (
                                <div className="passListItemMeta">{pass.department}</div>
                            )}
                            <span className={`passStatusBadge passStatusBadge--${pass.status.toLowerCase()}`}>
                                {getStatusLabel(pass.status)}
                            </span>
                        </div>

                        <PermissionGuard roles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER]}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {pass.status === 'Active' && (
                                    <Button
                                        size="s"
                                        mode="secondary"
                                        loading={suspendPass.isPending}
                                        onClick={() => handleSuspend(pass)}
                                    >
                                        Приостановить
                                    </Button>
                                )}
                                {pass.status === 'Suspended' && (
                                    <Button
                                        size="s"
                                        mode="primary"
                                        loading={reinstatePass.isPending}
                                        onClick={() => handleReinstate(pass)}
                                    >
                                        Восстановить
                                    </Button>
                                )}
                                {pass.status !== 'Revoked' && (
                                    <Button
                                        size="s"
                                        mode="destructive"
                                        loading={revokePass.isPending}
                                        onClick={() => handleRevoke(pass)}
                                    >
                                        Отозвать
                                    </Button>
                                )}
                            </div>
                        </PermissionGuard>
                    </div>
                ))}
            </Group>
        </Panel>
    );
};
