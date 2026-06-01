import React from 'react';
import { useToastContext } from './Toast.context';

export const useToast = () => {
    const context = useToastContext();

    return {
        ...context,

        success: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                intent: 'success',
            }),

        error: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                intent: 'error',
            }),

        warning: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                intent: 'warning',
            }),

        info: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                intent: 'info',
            }),
    };
};
