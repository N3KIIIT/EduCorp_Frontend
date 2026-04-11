'use client';

import React, { useEffect, useState } from 'react';
import {
    ModalRoot,
    ModalPage,
    ModalPageHeader,
    Spinner,
} from '@vkontakte/vkui';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigationStore } from '@/shared/lib/navigation/store';
import { useSessionStore } from '@/entities/session/model/store';
import { useMyPass } from '../api/pass-api';
import { useOrganizationInfo } from '@/features/organization/api/organization-api';
import '@/features/passes/passes.css';

const PASS_QR_MODAL_ID = 'pass-qr-modal';

const RUSSIAN_MONTHS = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} ${RUSSIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'Active':    return 'Активен';
        case 'Suspended': return 'Приостановлен';
        case 'Revoked':   return 'Отозван';
        case 'Expired':   return 'Истёк';
        default:          return status;
    }
}

/** Returns a human-readable countdown string like "23:41" or "1ч 02м" until the given ISO timestamp. */
function useTokenCountdown(tokenExpiresAt: string | null | undefined): string {
    const [label, setLabel] = useState('');

    useEffect(() => {
        if (!tokenExpiresAt) { setLabel(''); return; }

        const tick = () => {
            const msLeft = new Date(tokenExpiresAt).getTime() - Date.now();
            if (msLeft <= 0) { setLabel(''); return; }
            const totalSec = Math.floor(msLeft / 1000);
            const h = Math.floor(totalSec / 3600);
            const m = Math.floor((totalSec % 3600) / 60);
            const s = totalSec % 60;
            if (h > 0) {
                setLabel(`${h}ч ${String(m).padStart(2, '0')}м`);
            } else {
                setLabel(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            }
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [tokenExpiresAt]);

    return label;
}

export const PassCard: React.FC = () => {
    const { activeModal, openModal, closeModal } = useNavigationStore();
    const { user } = useSessionStore();
    const { data: pass, isLoading, isFetching } = useMyPass();
    const { data: orgInfo } = useOrganizationInfo();

    const countdown = useTokenCountdown(pass?.tokenExpiresAt);

    const handleQRClick = () => openModal(PASS_QR_MODAL_ID);
    const handleModalClose = () => closeModal();

    const fullName   = pass?.user?.fullName   ?? user?.fullName   ?? '';
    const position   = pass?.user?.position   ?? null;
    const department = pass?.user?.department ?? null;
    const orgName    = orgInfo?.name ?? '';

    // ── QR modal (expanded view) ──────────────────────────────────────────────
    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={handleModalClose}>
            <ModalPage
                id={PASS_QR_MODAL_ID}
                header={<ModalPageHeader>Мой пропуск</ModalPageHeader>}
            >
                <div className="passQRModal">
                    {orgName && <div className="passQRModalOrg">{orgName}</div>}
                    <div className="passQRModalTitle">{fullName}</div>
                    {position  && <div className="passQRModalMeta">{position}</div>}
                    {department && <div className="passQRModalMeta">{department}</div>}

                    {pass && (
                        <div className="passQRModalCode">
                            <QRCodeSVG
                                value={pass.token}
                                size={240}
                                level="M"
                                includeMargin={false}
                            />
                            {isFetching && (
                                <div className="passQRRefreshing">
                                    <Spinner size="s" />
                                    <span>Обновление QR…</span>
                                </div>
                            )}
                        </div>
                    )}

                    {pass && (
                        <div className="passQRModalFooter">
                            <span className={`passStatusBadge passStatusBadge--${pass.status.toLowerCase()}`}>
                                {getStatusLabel(pass.status)}
                            </span>
                            {countdown && (
                                <span className="passQRModalCountdown">
                                    ⟳ обновится через {countdown}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </ModalPage>
        </ModalRoot>
    );

    // ── Skeleton ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <>
                {modalRoot}
                <div className="passCardSkeleton" aria-busy="true">
                    <div className="passCardSkeletonQR" />
                    <div className="passCardSkeletonLines">
                        <div className="passCardSkeletonLine passCardSkeletonLine--wide" />
                        <div className="passCardSkeletonLine passCardSkeletonLine--mid" />
                        <div className="passCardSkeletonLine passCardSkeletonLine--short" />
                    </div>
                </div>
            </>
        );
    }

    // ── No pass ───────────────────────────────────────────────────────────────
    if (!pass) {
        return (
            <>
                {modalRoot}
                <div className="passNoCard">
                    <div className="passNoCardIcon">🪪</div>
                    <div className="passNoCardText">Пропуск не выдан</div>
                    <div className="passNoCardSub">Обратитесь к администратору</div>
                </div>
            </>
        );
    }

    // ── Active / Suspended / Revoked card ─────────────────────────────────────
    const isActive = pass.status === 'Active';

    return (
        <>
            {modalRoot}
            <div className={`passCard passCard--${pass.status.toLowerCase()}`}>
                {/* Decorative circles */}
                <div className="passCardDecor passCardDecor--1" />
                <div className="passCardDecor passCardDecor--2" />

                {/* Top row: org + status */}
                <div className="passCardHeader">
                    <span className="passCardOrg">{orgName || 'Пропуск сотрудника'}</span>
                    <span className={`passStatusBadge passStatusBadge--${pass.status.toLowerCase()}`}>
                        {getStatusLabel(pass.status)}
                    </span>
                </div>

                {/* Middle: QR (left) + info (right) */}
                <div className="passCardBody">
                    {/* QR block */}
                    <button
                        className="passCardQRBtn"
                        onClick={handleQRClick}
                        aria-label="Открыть QR-код"
                    >
                        {isActive ? (
                            <>
                                <QRCodeSVG
                                    value={pass.token}
                                    size={120}
                                    level="M"
                                    includeMargin={false}
                                    fgColor="#111"
                                />
                                {isFetching && (
                                    <div className="passCardQRSpinner">
                                        <Spinner size="s" />
                                    </div>
                                )}
                                <span className="passCardQRHint">увеличить</span>
                            </>
                        ) : (
                            <div className="passCardQRBlocked">
                                {pass.status === 'Suspended' ? '⏸' : '🚫'}
                            </div>
                        )}
                    </button>

                    {/* Employee info */}
                    <div className="passCardInfo">
                        <div className="passCardName">{fullName}</div>
                        {position && (
                            <div className="passCardPosition">{position}</div>
                        )}
                        {department && (
                            <div className="passCardDepartment">{department}</div>
                        )}
                        {pass.expiresAt && (
                            <div className="passCardValidUntil">
                                до {formatDate(pass.expiresAt)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Suspended / revoked reason */}
                {pass.status === 'Suspended' && (
                    <div className="passCardWarning">
                        ⚠️ Приостановлен{pass.suspendReason ? `: ${pass.suspendReason}` : ''}
                    </div>
                )}
                {pass.status === 'Revoked' && (
                    <div className="passCardWarning passCardWarning--error">
                        🚫 Пропуск отозван
                    </div>
                )}

                {/* Footer: token refresh countdown */}
                {isActive && countdown && (
                    <div className="passCardFooter">
                        <span className="passCardCountdown">⟳ QR обновится через {countdown}</span>
                    </div>
                )}
            </div>
        </>
    );
};
