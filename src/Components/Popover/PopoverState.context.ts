import React, { createContext, useContext } from 'react';

export type PopoverStateContextValue = {
    opened: boolean;
    setOpened: (opened: boolean) => void;

    isMounted: boolean;
    animationState: string;
};

export const PopoverStateContext = createContext<PopoverStateContextValue | null>(null);

export const usePopoverStateContext = () => {
    const context = useContext(PopoverStateContext);

    if (!context) {
        throw new Error('PopoverStateContext not found');
    }

    return context;
};
