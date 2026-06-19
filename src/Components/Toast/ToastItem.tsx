import React, { useEffect } from 'react';

import { ToastRecord, useToastContext } from './Toast.context';

import { classPrefix } from '../../utils/classPrefix';

import { Alert } from '../Alert';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const { close, requestClose } = useToastContext();

    const [visible, setVisible] = React.useState(true);

    const handleClose = () => {
        requestClose(toast.id);
    };

    useEffect(() => {
        if (toast.closing) {
            setVisible(false);
        }
    }, [toast.closing]);

    useEffect(() => {
        if (!toast.duration) {
            return;
        }

        const timeout = window.setTimeout(() => {
            requestClose(toast.id);
        }, toast.duration);

        return () => window.clearTimeout(timeout);
    }, [toast.duration]);

    return (
        <Alert
            // dismissible
            visible={visible}
            accent="left"
            shadow="sm"
            icon
            onDismiss={handleClose}
            onExited={() => close(toast.id)}
            className={prefix('__item')}
            intent={toast.intent}
            variant="subtle"
            role={toast.intent === 'danger' ? 'alert' : 'status'}
        >
            {toast.title && <Alert.Title>{toast.title}</Alert.Title>}

            {toast.description && (
                <Alert.Description className={prefix('__description')}>
                    {toast.description}
                </Alert.Description>
            )}
        </Alert>
    );
};
