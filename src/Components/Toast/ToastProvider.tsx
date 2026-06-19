import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';

import { ToastContext, ToastRecord } from './Toast.context';

import { ToastViewport } from './ToastViewport';
import { TransitionControlRef, TransitionAttention } from '../Transition';

// export type ToastRecord = ToastOptions & {
//     id: string;
//     closing?: boolean;
// };

export const toastPositions = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
] as const;

export type ToastPosition = (typeof toastPositions)[number];

export type ToastIntent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type ToastOptions = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    duration?: number | null;
    closable?: boolean;
    intent?: ToastIntent;

    renderActions?: (handle: ToastHandle) => React.ReactNode;
};

export type ToastProviderProps = {
    children?: React.ReactNode;
    position?: ToastPosition;
    offset?: number | string;
    max?: number;
    minCloseInterval?: number;
};

export type PendingClose = {
    id: string;
    leftTillClose: number;
};

export type ToastHandle = {
    id: string;
    runAttention: (attention?: TransitionAttention) => void;
    close: () => void;
    restart: () => void;
    update: (options: Partial<ToastOptions>) => void;
};

export type ToastControlRef = {
    restart: () => void;
    runAttention: (attention?: TransitionAttention) => void;
};

const QUEUE_PROCESSOR_INTERVAL = 50;

export const ToastProvider = ({
    children,
    position = 'top-right',
    offset = '1rem',
    max = 5,
    minCloseInterval = 1000,
}: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    const toastControlRefs = useRef(new Map<string, ToastControlRef>());
    const isPausedRef = React.useRef(isPaused);
    const intervalRef = React.useRef<number | null>(null);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    const pauseAll = useCallback(() => {
        setIsPaused(true);
    }, []);

    const resumeAll = useCallback(() => {
        setIsPaused(false);
    }, []);

    const closeQueueRef = React.useRef<PendingClose[]>([]);
    const closeTimerRef = React.useRef<number | null>(null);

    const getTimeLeftTillClose = (delay = 0) => {
        if (closeQueueRef.current.length <= 0) return delay;

        const maxItem = closeQueueRef.current.reduce((max, item) =>
            item.leftTillClose > max.leftTillClose ? item : max,
        );

        return maxItem.leftTillClose + delay;
    };

    const stopQueueProcessor = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startQueueProcessor = () => {
        if (intervalRef.current !== null) {
            return;
        }

        intervalRef.current = window.setInterval(() => {
            if (closeQueueRef.current.length === 0) {
                stopQueueProcessor();
                return;
            }

            if (isPausedRef.current) {
                return;
            }

            const idsToClose: string[] = [];

            closeQueueRef.current = closeQueueRef.current.map((item) => {
                const updatedLeftTillClose = item.leftTillClose - QUEUE_PROCESSOR_INTERVAL;

                if (updatedLeftTillClose <= 0) {
                    idsToClose.push(item.id);
                }

                return {
                    ...item,
                    leftTillClose: item.leftTillClose - QUEUE_PROCESSOR_INTERVAL,
                };
            });

            if (idsToClose.length <= 0) {
                return;
            }

            idsToClose.map((id) => {
                close(id);
                closeQueueRef.current = closeQueueRef.current.filter((item) => item.id != id);
            });

            // process queue
        }, QUEUE_PROCESSOR_INTERVAL);
    };

    useEffect(() => {
        return () => {
            stopQueueProcessor();
        };
    }, []);

    const close = (id: string) => {
        setToasts((prev) =>
            prev.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast)),
        );
    };

    const requestClose = useCallback(
        (id: string) => {
            startQueueProcessor();

            closeQueueRef.current.push({
                id,
                leftTillClose: getTimeLeftTillClose(minCloseInterval),
            });
        },
        [minCloseInterval],
    );

    const clear = useCallback(() => {
        setToasts([]);
    }, []);

    const update = useCallback((id: string, options: Partial<ToastOptions>) => {
        setToasts((prev) =>
            prev.map((toast) =>
                toast.id === id
                    ? {
                          ...toast,
                          ...options,
                      }
                    : toast,
            ),
        );
    }, []);

    const show = useCallback((options: ToastOptions): ToastHandle => {
        const id = crypto.randomUUID();

        setToasts((prev) => {
            const limited = prev.length >= max ? prev.slice(1) : prev;

            return [
                ...limited,
                {
                    id,
                    // duration: 5000,
                    duration: 5000,
                    closable: true,
                    intent: 'info',
                    ...options,
                },
            ];
        });

        return {
            id,
            close: () => close(id),
            runAttention: (attention) => {
                const ref = toastControlRefs.current.get(id);
                ref?.runAttention(attention);
            },
            restart: () => {
                const ref = toastControlRefs.current.get(id);
                ref?.restart();
            },
            update: (options) => {
                update(id, options);
            },
        };
    }, []);

    const value = useMemo(
        () => ({
            position,
            update,
            toasts,
            show,
            close,
            requestClose,
            clear,
            isPaused,
            pauseAll,
            resumeAll,
            minCloseInterval,
            toastControlRefs,
            closeQueueRef,
        }),
        [position, update, toasts, show, close, requestClose, clear, isPaused, pauseAll, resumeAll],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <ToastViewport
                position={position}
                offset={offset}
                onMouseEnter={pauseAll}
                onMouseLeave={resumeAll}
            />
        </ToastContext.Provider>
    );
};
