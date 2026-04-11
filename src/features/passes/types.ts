export type PassStatus = 'Active' | 'Suspended' | 'Revoked' | 'Expired';

export type PassUserInfo = {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    department?: string | null;
    position?: string | null;
};

export type PassResponse = {
    id: string;
    userId: string;
    token: string;
    status: PassStatus;
    createdAt: string;
    expiresAt: string | null;
    suspendedAt: string | null;
    suspendReason: string | null;
    user?: PassUserInfo | null;
};

export type PassBriefResponse = {
    id: string;
    userId: string;
    status: PassStatus;
    createdAt: string;
    expiresAt: string | null;
    userName?: string | null;
    department?: string | null;
};

export type CreatePassRequest = {
    userId: string;
    expiresAt?: string | null;
};

export type SuspendPassRequest = {
    reason: string;
};

export type ValidatePassRequest = {
    token: string;
};

export type PassScanResultResponse = {
    isValid: boolean;
    passId: string;
    userId: string;
    userName: string;
    status: PassStatus;
    scannedAt: string;
    message?: string | null;
    department?: string | null;
    position?: string | null;
    avatarUrl?: string | null;
};

export type PassScanLogResponse = {
    id: string;
    passId: string;
    scannedAt: string;
    location?: string | null;
    result: string;
    isSuccess: boolean;
};
