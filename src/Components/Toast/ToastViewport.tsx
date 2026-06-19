import React from 'react';

import { createPortal } from 'react-dom';

import { useToastContext } from './Toast.context';
import { ToastItem } from './ToastItem';

import { classPrefix } from '../../utils/classPrefix';
import { ToastPosition } from './ToastProvider';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastViewportProps = {
    position: ToastPosition;
    offset?: number | string;
};

export const ToastViewport = ({ position, offset }: ToastViewportProps) => {
    const { toasts } = useToastContext();

    return createPortal(
        <div
            className={prefix('__viewport')}
            data-position={position}
            style={
                {
                    '--toast-offset': typeof offset === 'number' ? `${offset}px` : offset,
                } as React.CSSProperties
            }
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>,
        document.body,
    );
};
