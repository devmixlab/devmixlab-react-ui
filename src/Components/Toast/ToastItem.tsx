import React, { useEffect, useCallback } from 'react';
import { ToastRecord, useToastContext } from './Toast.context';
import { classPrefix } from '../../utils/classPrefix';
import { Alert } from '../Alert';
import { TransitionAttention, TransitionControlRef } from '../Transition';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const { update, close, requestClose, isPaused, toastControlRefs, closeQueueRef } =
        useToastContext();

    const [visible, setVisible] = React.useState(true);

    const isClosable = toast.closable;

    const controlRef = React.useRef<TransitionControlRef>(null);

    const timeoutRef = React.useRef<number | null>(null);
    const remainingRef = React.useRef(toast.duration ?? 0);
    const startedAtRef = React.useRef<number | null>(null);

    console.log(toast);

    const handleClose = () => {
        close(toast.id);
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

    const restart = useCallback(() => {
        if (!toast.duration) {
            return;
        }

        closeQueueRef.current = closeQueueRef.current.filter((item) => item.id !== toast.id);

        remainingRef.current = toast.duration ?? 0;

        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        startedAtRef.current = Date.now();

        timeoutRef.current = window.setTimeout(() => {
            requestClose(toast.id);
        }, remainingRef.current);
    }, [toast.duration, toast.id, requestClose]);

    const runAttention = (attention?: TransitionAttention) => {
        controlRef.current?.runAttention(attention);
    };

    useEffect(() => {
        toastControlRefs.current.set(toast.id, {
            restart,
            runAttention,
        });

        return () => {
            toastControlRefs.current.delete(toast.id);
        };
    }, [toast.id, restart]);

    return (
        <Alert
            // dismissible
            controlRef={controlRef}
            animation="slide-up"
            attention="bounce"
            visible={visible}
            // accent="left"
            shadow="sm"
            icon
            onDismiss={toast.closable ? handleClose : undefined}
            // onDismiss={handleClose}
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

            {toast.renderActions && (
                <Alert.Actions>
                    {toast.renderActions({
                        id: toast.id,
                        close: () => close(toast.id),
                        runAttention,
                        restart,
                        update: (options) => {
                            update(toast.id, options);
                        },
                    })}
                </Alert.Actions>
            )}
        </Alert>
    );
};
