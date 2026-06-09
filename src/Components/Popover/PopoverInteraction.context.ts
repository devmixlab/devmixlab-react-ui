import React, { createContext, useContext } from 'react';

export type PopoverInteractionContextValue = {
    trigger: 'click' | 'hover';

    openDelay: number;
    closeDelay: number;

    disabled: boolean;

    handleHoverEnter: () => void;
    handleHoverLeave: () => void;
};

export const PopoverInteractionContext = createContext<PopoverInteractionContextValue | null>(null);

export const usePopoverInteractionContext = () => {
    const context = useContext(PopoverInteractionContext);

    if (!context) {
        throw new Error('PopoverInteractionContext not found');
    }

    return context;
};
