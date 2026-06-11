import React, { useEffect } from 'react';

import { ToastRecord, useToastContext } from './Toast.context';

import { classPrefix } from '../utils/classPrefix';

import { Alert } from '../Components/Alert/Alert';

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
        <Alert
            dismissible
            accent
            onDismiss={() => close(toast.id)}
            className={prefix('__item')}
            intent={toast.intent}
            data-intent={toast.intent}
            role={toast.intent === 'danger' ? 'alert' : 'status'}
        >
            <div className={prefix('__content')}>
                {toast.title && <div className={prefix('__title')}>{toast.title}</div>}

                {toast.description && (
                    <div className={prefix('__description')}>{toast.description}</div>
                )}
            </div>

            {/*{toast.closable && (*/}
            {/*    <button type="button" onClick={() => close(toast.id)}>*/}
            {/*        ×*/}
            {/*    </button>*/}
            {/*)}*/}
        </Alert>
    );
};
