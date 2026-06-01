import React, { useCallback, useMemo, useState } from 'react';

import { ToastContext, ToastRecord } from './Toast.context';

import { ToastViewport } from './ToastViewport';

export type ToastIntent = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    duration?: number;
    closable?: boolean;
    intent?: ToastIntent;
};

export type ToastProviderProps = {
    children?: React.ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);

    const close = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clear = useCallback(() => {
        setToasts([]);
    }, []);

    const show = useCallback((options: ToastOptions) => {
        const id = crypto.randomUUID();

        setToasts((prev) => [
            ...prev,
            {
                id,
                duration: 5000,
                closable: true,
                intent: 'info',
                ...options,
            },
        ]);

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

            <ToastViewport />
        </ToastContext.Provider>
    );
};
