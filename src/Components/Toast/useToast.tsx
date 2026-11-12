import React from 'react';
import { useToastActions } from './Toast.context';
import { Button } from '../Button';
import { Box } from '../Box';

export const useToast = () => {
  const context = useToastActions();

  return {
    ...context,

    success: (title: React.ReactNode, description?: React.ReactNode) =>
      context.show({
        title,
        description,
        closable: true,
        duration: null,
        intent: 'success',
        renderActions: ({ close }) => (
          <Box d="flex" grow={1} justify="end">
            <Button onClick={close} intent="success" size="sm" variant="ghost">
              Dismiss
            </Button>
          </Box>
        ),
      }),

    primary: (title: React.ReactNode, description?: React.ReactNode) =>
      context.show({
        title,
        description,
        intent: 'primary',
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
