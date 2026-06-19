import React, { useEffect } from 'react';

import { ToastRecord, useToastContext } from './Toast.context';

import { classPrefix } from '../../utils/classPrefix';

import { Alert } from '../Alert';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const { close, requestClose, isPaused, controlRefs } = useToastContext();

    const [visible, setVisible] = React.useState(true);

    const timeoutRef = React.useRef<number | null>(null);
    const remainingRef = React.useRef(toast.duration ?? 0);
    const startedAtRef = React.useRef<number | null>(null);

    const handleClose = () => {
        requestClose(toast.id);
    };

    useEffect(() => {
        if (toast.closing) {
            setVisible(false);
        }
    }, [toast.closing]);

    useEffect(() => {
        remainingRef.current = toast.duration ?? 0;
        startedAtRef.current = null;
    }, [toast.id, toast.duration]);

    useEffect(() => {
        if (!toast.duration) {
            return;
        }

        const clearTimer = () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        // console.log('pause', {
        //     remaining: remainingRef.current,
        //     startedAt: startedAtRef.current,
        // });
        //
        // console.log('resume', {
        //     remaining: remainingRef.current,
        // });

        if (isPaused) {
            clearTimer();

            if (startedAtRef.current !== null) {
                const elapsed = Date.now() - startedAtRef.current;

                remainingRef.current = Math.max(0, remainingRef.current - elapsed);

                startedAtRef.current = null;
            }

            return;
        }

        if (remainingRef.current <= 0) {
            requestClose(toast.id);

            return;
        }

        startedAtRef.current = Date.now();

        timeoutRef.current = window.setTimeout(() => {
            requestClose(toast.id);
        }, remainingRef.current);

        return clearTimer;
    }, [toast.id, toast.duration, isPaused, requestClose]);

    return (
        <Alert
            // dismissible
            controlRef={(el) => {
                if (el) {
                    controlRefs.current.set(toast.id, el);
                } else {
                    controlRefs.current.delete(toast.id);
                }
            }}
            animation="slide-right"
            attention="throb"
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
            {toast.title && (
                <Alert.Title>
                    {toast.title} - {isPaused ? 'paused' : 'running'}
                </Alert.Title>
            )}

            {toast.description && (
                <Alert.Description className={prefix('__description')}>
                    {toast.description}
                </Alert.Description>
            )}
        </Alert>
    );
};
