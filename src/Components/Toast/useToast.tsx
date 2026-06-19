import React from 'react';
import { useToastContext } from './Toast.context';
import { Button } from '../Button';
import { Box } from '../Box';

export const useToast = () => {
    const context = useToastContext();

    return {
        ...context,

        success: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                closable: true,
                duration: null,
                intent: 'secondary',
                renderActions: ({ close }) => {
                    return (
                        <Box d="flex" grow={1} justify="end">
                            <Button onClick={close} intent="success" size="sm" variant="solid">
                                Dismiss
                            </Button>
                        </Box>
                    );
                },
            }),

        error: (title: React.ReactNode, description?: React.ReactNode) =>
            context.show({
                title,
                description,
                intent: 'danger',
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
