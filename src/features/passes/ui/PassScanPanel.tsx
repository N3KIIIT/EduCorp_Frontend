'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import { useValidatePass } from '../api/pass-api';
import type { PassScanResultResponse } from '../types';
import '@/features/passes/passes.css';

interface PassScanPanelProps {
    id: string;
}

function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
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

export const PassScanPanel: React.FC<PassScanPanelProps> = ({ id }) => {
    const { goBackPanel } = useNavigationStore();
    const validatePass = useValidatePass();
    const [scanResult, setScanResult] = useState<PassScanResultResponse | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(true);
    const scannerRef = useRef<unknown>(null);

    const onScanSuccess = (decodedText: string) => {
        setShowScanner(false);
        validatePass.mutate(
            { token: decodedText },
            {
                onSuccess: (result) => {
                    setScanResult(result);
                    setScanError(null);
                },
                onError: (error) => {
                    setScanResult(null);
                    setScanError(error instanceof Error ? error.message : 'Ошибка валидации пропуска');
                },
            }
        );
    };

    const onScanError = (_errorMessage: string) => {
        // Ignore frequent scan errors (camera frames without QR code)
    };

    useEffect(() => {
        if (!showScanner) return;
        if (typeof window === 'undefined') return;

        let scanner: {
            render: (onSuccess: (text: string) => void, onError: (msg: string) => void) => void;
            clear: () => Promise<void>;
        } | null = null;

        const initScanner = async () => {
            const { Html5QrcodeScanner } = await import('html5-qrcode');
            scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
            scanner.render(onScanSuccess, onScanError);
            scannerRef.current = scanner;
        };

        initScanner().catch(console.error);

        return () => {
            if (scanner) {
                scanner.clear().catch(() => {});
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showScanner]);

    const handleNewScan = () => {
        setScanResult(null);
        setScanError(null);
        setShowScanner(true);
    };

    return (
        <Panel id={id}>
            <PanelHeader before={<PanelHeaderBack onClick={goBackPanel} />}>
                Сканер пропусков
            </PanelHeader>

            <Group>
                {showScanner && (
                    <Div>
                        <div id="qr-reader" />
                    </Div>
                )}

                {validatePass.isPending && (
                    <Div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                        <Spinner size="m" />
                    </Div>
                )}

                {scanResult && (
                    <Div>
                        <div className={`passScanResult passScanResult--${scanResult.isValid ? 'valid' : 'invalid'}`}>
                            <div className="passScanResultIcon">
                                {scanResult.isValid ? '✅' : '❌'}
                            </div>

                            {scanResult.avatarUrl ? (
                                <Avatar src={scanResult.avatarUrl} size={64} />
                            ) : (
                                <Avatar size={64}>
                                    {scanResult.userName?.charAt(0) ?? '?'}
                                </Avatar>
                            )}

                            <div className="passScanResultName">{scanResult.userName}</div>

                            {(scanResult.department || scanResult.position) && (
                                <div className="passScanResultMeta">
                                    {[scanResult.position, scanResult.department].filter(Boolean).join(' · ')}
                                </div>
                            )}

                            <span className={`passStatusBadge passStatusBadge--${scanResult.status.toLowerCase()}`}>
                                {getStatusLabel(scanResult.status)}
                            </span>

                            <div className="passScanResultMeta">
                                {formatDateTime(scanResult.scannedAt)}
                            </div>

                            {scanResult.message && (
                                <div className="passScanResultMessage">{scanResult.message}</div>
                            )}
                        </div>

                        <Div>
                            <Button
                                size="l"
                                stretched
                                mode="secondary"
                                onClick={handleNewScan}
                            >
                                Новое сканирование
                            </Button>
                        </Div>
                    </Div>
                )}

                {scanError && !validatePass.isPending && (
                    <Div>
                        <div className="passScanResult passScanResult--invalid">
                            <div className="passScanResultIcon">❌</div>
                            <div className="passScanResultName">Ошибка</div>
                            <div className="passScanResultMessage">{scanError}</div>
                        </div>

                        <Div>
                            <Button
                                size="l"
                                stretched
                                mode="secondary"
                                onClick={handleNewScan}
                            >
                                Новое сканирование
                            </Button>
                        </Div>
                    </Div>
                )}
            </Group>
        </Panel>
    );
};
