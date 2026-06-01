import React, { useEffect } from 'react';

import { ToastRecord, useToastContext } from './Toast.context';

import { classPrefix } from '../utils/classPrefix';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const { close } = useToastContext();

    useEffect(() => {
        if (!toast.duration) {
            return;
        }

        const timeout = window.setTimeout(() => {
            close(toast.id);
        }, toast.duration);

        return () => window.clearTimeout(timeout);
    }, [toast.id, toast.duration, close]);

    return (
        <div
            className={prefix('__item')}
            data-intent={toast.intent}
            role={toast.intent === 'error' ? 'alert' : 'status'}
        >
            <div className={prefix('__content')}>
                {toast.title && <div className={prefix('__title')}>{toast.title}</div>}

                {toast.description && (
                    <div className={prefix('__description')}>{toast.description}</div>
                )}
            </div>

            {toast.closable && (
                <button type="button" onClick={() => close(toast.id)}>
                    ×
                </button>
            )}
        </div>
    );
};
