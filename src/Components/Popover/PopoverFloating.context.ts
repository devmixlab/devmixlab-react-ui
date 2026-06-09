import React, { createContext, useContext } from 'react';
import type { FloatingContext, UseFloatingReturn } from '@floating-ui/react';

export type PopoverFloatingContextValue = {
    refs: UseFloatingReturn['refs'];

    context: FloatingContext;

    floatingStyles: React.CSSProperties;

    getReferenceProps: any;
    getFloatingProps: any;

    placement: string;
};

export const PopoverFloatingContext = createContext<PopoverFloatingContextValue | null>(null);

export const usePopoverFloatingContext = () => {
    const context = useContext(PopoverFloatingContext);

    if (!context) {
        throw new Error('PopoverFloatingContext not found');
    }

    return context;
};
