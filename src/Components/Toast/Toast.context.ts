import React, { createContext, MutableRefObject, useContext } from 'react';

import {
    ToastOptions,
    ToastHandle,
    ToastControlRef,
    PendingClose,
    ToastPosition,
} from './ToastProvider';
import { TransitionControlRef } from '../Transition';

// export type ToastRecord = ToastOptions & {
//     id: string;
// };

export type ToastRecord = ToastOptions & {
    id: string;
    closing?: boolean;
};

export type ToastContextValue = {
    position: ToastPosition;

    update: (id: string, options: Partial<ToastOptions>) => void;

    toasts: ToastRecord[];

    show: (options: ToastOptions) => ToastHandle;

    requestClose: (id: string) => void;

    close: (id: string) => void;

    clear: () => void;

    isPaused: boolean;

    pauseAll: () => void;

    resumeAll: () => void;

    minCloseInterval: number;

    toastControlRefs: MutableRefObject<Map<string, ToastControlRef>>;
    closeQueueRef: MutableRefObject<PendingClose[]>;
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
