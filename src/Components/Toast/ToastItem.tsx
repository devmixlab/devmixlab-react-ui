import React, { useEffect } from 'react';

import { ToastRecord, useToastContext } from './Toast.context';

import { classPrefix } from '../../utils/classPrefix';

import { Alert } from '../Alert';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const { close } = useToastContext();

    const [visible, setVisible] = React.useState(true);

    const handleClose = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (!toast.duration) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setVisible(false);
        }, toast.duration);

        return () => window.clearTimeout(timeout);
    }, [toast.duration]);

    // useEffect(() => {
    //     if (!toast.duration) {
    //         return;
    //     }
    //
    //     const timeout = window.setTimeout(() => {
    //         close(toast.id);
    //     }, toast.duration);
    //
    //     return () => window.clearTimeout(timeout);
    // }, [toast.id, toast.duration, close]);

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
