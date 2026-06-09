import { createContext, useContext } from 'react';

export type PopoverConfigContextValue = {
    variant: string;

    animation: string;

    animationEnterDuration: number;
    animationExitDuration: number;

    enterAnimationEasing: string;
    exitAnimationEasing: string;

    modal: boolean;

    backdrop: boolean;
    backdropVariant: 'transparent' | 'blur' | 'dim';

    closeOnOutsideClick: boolean;

    returnFocus: boolean;

    onReady?: () => void;

    keepMounted: boolean;
};

export const PopoverConfigContext = createContext<PopoverConfigContextValue | null>(null);

export const usePopoverConfigContext = () => {
    const context = useContext(PopoverConfigContext);

    if (!context) {
        throw new Error('PopoverConfigContext not found');
    }

    return context;
};
