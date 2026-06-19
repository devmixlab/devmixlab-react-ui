import React from 'react';

import { createPortal } from 'react-dom';

import { useToastContext } from './Toast.context';
import { ToastItem } from './ToastItem';

import { classPrefix } from '../../utils/classPrefix';
import { ToastPosition } from './ToastProvider';
import { clsx } from 'clsx';

const prefix = (name = '') => classPrefix(`--toast${name}`);

type ToastViewportProps = {
    position: ToastPosition;
    offset?: number | string;
} & React.HTMLAttributes<HTMLDivElement>;

export const ToastViewport = ({ className, position, offset, ...rest }: ToastViewportProps) => {
    const { toasts } = useToastContext();

    return createPortal(
        <div
            {...rest}
            className={clsx(prefix('__viewport'), className)}
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
