import React, { createContext, useContext } from 'react';

import { ToastOptions } from './ToastProvider';

// export type ToastRecord = ToastOptions & {
//     id: string;
// };

export type ToastRecord = ToastOptions & {
    id: string;
    closing?: boolean;
};

export type ToastContextValue = {
    toasts: ToastRecord[];

    show: (options: ToastOptions) => string;

    requestClose: (id: string) => void;

    close: (id: string) => void;

    clear: () => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

// export const ToastProviderContext = ToastContext.Provider;

export const useToastContext = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    return context;
};
