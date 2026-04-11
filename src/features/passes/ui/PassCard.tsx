'use client';

import React, { useState } from 'react';
import {
    Div,
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

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = RUSSIAN_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'Active': return 'Активен';
        case 'Suspended': return 'Приостановлен';
        case 'Revoked': return 'Отозван';
        case 'Expired': return 'Истёк';
        default: return status;
    }
}

export const PassCard: React.FC = () => {
    const { activeModal, openModal, closeModal } = useNavigationStore();
    const { user } = useSessionStore();
    const { data: pass, isLoading } = useMyPass();
    const { data: orgInfo } = useOrganizationInfo();

    const [, setQrOpen] = useState(false);

    const handleQRClick = () => {
        setQrOpen(true);
        openModal(PASS_QR_MODAL_ID);
    };

    const handleModalClose = () => {
        setQrOpen(false);
        closeModal();
    };

    const fullName = pass?.user?.fullName ?? user?.fullName ?? '';
    const position = pass?.user?.position ?? null;
    const department = pass?.user?.department ?? null;
    const orgName = orgInfo?.name ?? '';

    const modalRoot = (
        <ModalRoot activeModal={activeModal} onClose={handleModalClose}>
            <ModalPage
                id={PASS_QR_MODAL_ID}
                header={
                    <ModalPageHeader onClose={handleModalClose}>
                        Мой пропуск
                    </ModalPageHeader>
                }
            >
                <div className="passQRModal">
                    <div className="passQRModalTitle">{fullName}</div>
                    {pass && (
                        <>
                            <QRCodeSVG value={pass.token} size={220} />
                            {pass.expiresAt && (
                                <div className="passQRModalSubtitle">
                                    Действителен до: {formatDate(pass.expiresAt)}
                                </div>
                            )}
                            <div className="passQRModalSubtitle">
                                <span className={`passStatusBadge passStatusBadge--${pass.status.toLowerCase()}`}>
                                    {getStatusLabel(pass.status)}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </ModalPage>
        </ModalRoot>
    );

    if (isLoading) {
        return (
            <>
                {modalRoot}
                <div
                    className="passCard"
                    style={{
                        minHeight: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        opacity: 0.6,
                    }}
                >
                    <Spinner size="medium" style={{ color: '#fff' }} />
                </div>
            </>
        );
    }

    if (!pass) {
        return (
            <>
                {modalRoot}
                <div className="passNoCard">
                    <div className="passNoCardIcon">🪪</div>
                    <div className="passNoCardText">Пропуск не выдан</div>
                </div>
            </>
        );
    }

    return (
        <>
            {modalRoot}
            <div className="passCard">
                <div className="passCardTop">
                    <div className="passCardEmployeeInfo">
                        {orgName && (
                            <div className="passCardOrg">{orgName}</div>
                        )}
                        <div className="passCardName">{fullName}</div>
                        {position && (
                            <div className="passCardPosition">{position}</div>
                        )}
                        {department && (
                            <div className="passCardDepartment">{department}</div>
                        )}
                    </div>

                    <div className="passCardQR" onClick={handleQRClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleQRClick(); }}>
                        <QRCodeSVG value={pass.token} size={88} />
                        <div className="passCardQRLabel">QR</div>
                    </div>
                </div>

                {pass.status === 'Suspended' && (
                    <Div style={{ padding: '0 0 8px' }}>
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(255,193,7,0.25)',
                            color: '#ffe082',
                            border: '1px solid rgba(255,193,7,0.3)',
                            borderRadius: 12,
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                        }}>
                            ⚠️ Пропуск приостановлен{pass.suspendReason ? `: ${pass.suspendReason}` : ''}
                        </span>
                    </Div>
                )}

                {pass.status === 'Revoked' && (
                    <Div style={{ padding: '0 0 8px' }}>
                        <span style={{
                            display: 'inline-block',
                            background: 'rgba(244,67,54,0.25)',
                            color: '#ef9a9a',
                            border: '1px solid rgba(244,67,54,0.3)',
                            borderRadius: 12,
                            padding: '4px 10px',
                            fontSize: 12,
                            fontWeight: 600,
                        }}>
                            🚫 Пропуск отозван
                        </span>
                    </Div>
                )}

                <div className="passStatusRow">
                    <span className={`passStatusBadge passStatusBadge--${pass.status.toLowerCase()}`}>
                        {getStatusLabel(pass.status)}
                    </span>
                    {pass.expiresAt && (
                        <span className="passCardExpiry">
                            до {formatDate(pass.expiresAt)}
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};
