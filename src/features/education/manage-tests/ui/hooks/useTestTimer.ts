'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Countdown timer hook.
 * - Uses setTimeout per tick to avoid setInterval drift.
 * - Always calls the latest onTimeout via ref — no stale closure.
 * - Fires onTimeout exactly once when seconds reaches 0.
 */
export function useTestTimer(
    initialSeconds: number | null,
    onTimeout: () => void,
    stopped: boolean,
): number | null {
    const [seconds, setSeconds] = useState<number | null>(null);
    const onTimeoutRef = useRef(onTimeout);

    // Keep ref up-to-date on every render so timer always calls latest callback
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    });

    // Sync initial value when test starts
    useEffect(() => {
        setSeconds(initialSeconds);
    }, [initialSeconds]);

    // Schedule next tick
    useEffect(() => {
        if (seconds === null || seconds <= 0 || stopped) return;

        const id = setTimeout(() => {
            setSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
        }, 1000);

        return () => clearTimeout(id);
    }, [seconds, stopped]);

    // Fire callback when seconds reaches 0 (separate from tick logic)
    useEffect(() => {
        if (seconds === 0 && !stopped) {
            onTimeoutRef.current();
        }
    }, [seconds, stopped]);

    return seconds;
}
