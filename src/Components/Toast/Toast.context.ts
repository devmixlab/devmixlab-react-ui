import React, { createContext, MutableRefObject, useContext } from 'react';

import { ToastOptions, ToastHandle } from './ToastProvider';
import { TransitionControlRef } from '../Transition';

// export type ToastRecord = ToastOptions & {
//     id: string;
// };

export type ToastRecord = ToastOptions & {
    id: string;
    closing?: boolean;
};

export type ToastContextValue = {
    toasts: ToastRecord[];

    show: (options: ToastOptions) => ToastHandle;

    requestClose: (id: string) => void;

    close: (id: string) => void;

    clear: () => void;

    isPaused: boolean;

    pauseAll: () => void;

    resumeAll: () => void;

    minCloseInterval: number;

    controlRefs: MutableRefObject<Map<string, TransitionControlRef>>;
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
