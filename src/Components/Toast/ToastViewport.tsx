import React from 'react';

import { createPortal } from 'react-dom';

import { useToastContext } from './Toast.context';
import { ToastItem } from './ToastItem';

import { classPrefix } from '../../utils/classPrefix';

const prefix = (name = '') => classPrefix(`--toast${name}`);

export const ToastViewport = () => {
    const { toasts } = useToastContext();

    return createPortal(
        <div className={prefix('__viewport')}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>,
        document.body,
    );
};
