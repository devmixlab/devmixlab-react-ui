import React, { useEffect, useCallback, useLayoutEffect } from 'react';
import { ToastRecord, useToastContext } from './Toast.context';
import { classPrefix } from '../../utils/classPrefix';
import { Alert } from '../Alert';
import { TransitionAttention, TransitionControlRef, Transition } from '../Transition';
import { ToastOptions } from './ToastProvider';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastItemProps = {
    toast: ToastRecord;
};

export const ToastItem = ({ toast }: ToastItemProps) => {
    const {
        remove,
        position,
        update,
        close,
        requestClose,
        isPaused,
        toastControlRefs,
        closeQueueRef,
    } = useToastContext();

    const [wrapperIn, setWrapperIn] = React.useState(false);
    const [visible, setVisible] = React.useState(true);
    const [height, setHeight] = React.useState(0);

    const controlRef = React.useRef<TransitionControlRef>(null);

    const alertRef = React.useRef<HTMLDivElement>(null);
    const timeoutRef = React.useRef<number | null>(null);
    const remainingRef = React.useRef(toast.duration ?? 0);
    const startedAtRef = React.useRef<number | null>(null);

    const handleClose = () => {
        close(toast.id);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setWrapperIn(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

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

    useLayoutEffect(() => {
        if (!alertRef.current) {
            return;
        }

        const element = alertRef.current;

        const observer = new ResizeObserver(() => {
            setHeight(element.offsetHeight);
        });

        observer.observe(element);

        setHeight(element.offsetHeight);

        return () => observer.disconnect();
    }, []);

    const renderContent = {
        id: toast.id,
        close: () => close(toast.id),
        runAttention,
        restart,
        update: (options: ToastOptions) => {
            update(toast.id, options);
        },
    };

    return (
        <Transition
            visible={wrapperIn}
            animation="toast-wrapper"
            enterDuration={250}
            exitDuration={200}
            onExited={() => {
                remove(toast.id);
            }}
            className={prefix('__item-wrapper')}
            data-position={position}
            data-wrapper-in={wrapperIn || undefined}
            keepMounted
            style={
                {
                    '--toast-height': `${height}px`,
                } as React.CSSProperties
            }
        >
            <Alert
                ref={alertRef}
                controlRef={controlRef}
                animation="toast-bottom"
                enterDuration={350}
                exitDuration={250}
                visible={visible}
                shadow={toast.shadow ?? 'md'}
                onDismiss={toast.closable ? handleClose : undefined}
                onExited={() => {
                    // close(toast.id);
                    setWrapperIn(false);
                }}
                className={prefix('__item')}
                intent={toast.intent ?? 'secondary'}
                variant={toast.variant ?? 'subtle'}
                accent={toast.accent ?? 'left'}
                size={toast.size ?? 'md'}
                icon={toast.icon}
                role={toast.intent === 'danger' ? 'alert' : 'status'}
                data-position={position}
            >
                {toast.title && <Alert.Title>{toast.title}</Alert.Title>}

                {toast.description && (
                    <Alert.Description className={prefix('__description')}>
                        {toast.description}
                    </Alert.Description>
                )}

                {toast.renderContent?.(renderContent)}

                {toast.renderActions && (
                    <Alert.Actions>{toast.renderActions(renderContent)}</Alert.Actions>
                )}
            </Alert>
        </Transition>
    );
};
