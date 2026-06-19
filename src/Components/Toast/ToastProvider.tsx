import React, { useCallback, useMemo, useState } from 'react';

import { ToastContext, ToastRecord } from './Toast.context';

import { ToastViewport } from './ToastViewport';

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
    duration?: number;
    closable?: boolean;
    intent?: ToastIntent;
};

export type ToastProviderProps = {
    children?: React.ReactNode;
    position?: ToastPosition;
    offset?: number | string;
    max?: number;
    minCloseInterval?: number;
};

export const ToastProvider = ({
    children,
    position = 'top-right',
    offset = '1rem',
    max = 5,
    minCloseInterval = 1000,
}: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);

    const closeQueueRef = React.useRef<string[]>([]);
    const closeTimerRef = React.useRef<number | null>(null);

    const requestClose = useCallback(
        (id: string) => {
            if (closeQueueRef.current.includes(id)) {
                return;
            }

            closeQueueRef.current.push(id);

            if (closeTimerRef.current) {
                return;
            }

            const processNext = () => {
                const nextId = closeQueueRef.current.shift();

                if (!nextId) {
                    closeTimerRef.current = null;
                    return;
                }

                setToasts((prev) =>
                    prev.map((toast) =>
                        toast.id === nextId
                            ? {
                                  ...toast,
                                  closing: true,
                              }
                            : toast,
                    ),
                );

                closeTimerRef.current = window.setTimeout(processNext, minCloseInterval);
            };

            processNext();
        },
        [minCloseInterval],
    );

    const clear = useCallback(() => {
        setToasts([]);
    }, []);

    const show = useCallback((options: ToastOptions) => {
        const id = crypto.randomUUID();

        setToasts((prev) => {
            const limited = prev.length >= max ? prev.slice(1) : prev;

            return [
                ...limited,
                {
                    id,
                    duration: 5000,
                    closable: true,
                    intent: 'info',
                    ...options,
                },
            ];
        });

        return id;
    }, []);

    const value = useMemo(
        () => ({
            toasts,
            show,
            close,
            requestClose,
            clear,
        }),
        [toasts, show, close, requestClose, clear],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <ToastViewport position={position} offset={offset} />
        </ToastContext.Provider>
    );
};
