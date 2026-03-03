
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5276/api',
    TIMEOUT: 30_000,
    REFRESH_THRESHOLD_MS: 5 * 60 * 1000,
} as const;
