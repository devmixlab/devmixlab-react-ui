import React, { useCallback, useMemo, useState } from 'react';

import { ToastContext, ToastRecord } from './Toast.context';

import { ToastViewport } from './ToastViewport';

export const toastPositions = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
] as const;

export type ToastPosition = (typeof toastPositions)[number];

// export type ToastIntent = 'success' | 'error' | 'warning' | 'info';
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
};

export const ToastProvider = ({
    children,
    position = 'top-right',
    offset = '1rem',
    max = 5,
}: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);

    const close = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clear = useCallback(() => {
        setToasts([]);
    }, []);

    const show = useCallback((options: ToastOptions) => {
        const id = crypto.randomUUID();

        // setToasts((prev) => [
        //     ...prev,
        //     {
        //         id,
        //         duration: 5000,
        //         closable: true,
        //         intent: 'info',
        //         ...options,
        //     },
        // ]);

        // setToasts((prev) => {
        //     const next = [
        //         ...prev,
        //         {
        //             id,
        //             duration: 5000,
        //             closable: true,
        //             intent: 'info',
        //             ...options,
        //         },
        //     ];
        //
        //     return next.slice(-max);
        // });

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
            clear,
        }),
        [toasts, show, close, clear],
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            <ToastViewport position={position} offset={offset} />
        </ToastContext.Provider>
    );
};
