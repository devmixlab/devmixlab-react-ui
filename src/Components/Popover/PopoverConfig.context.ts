import { createContext, useContext } from 'react';
import { PopoverMotionPreset } from './Popover';

export type PopoverConfigContextValue = {
    variant: string;

    motionPreset: PopoverMotionPreset;

    // animation: string;

    // enterDuration: number;
    // exitDuration: number;

    // enterEasing: string;
    // exitEasing: string;

    modal: boolean;

    backdrop: boolean;
    backdropVariant: 'transparent' | 'blur' | 'dim';

    closeOnOutsideClick: boolean;

    returnFocus: boolean;

    onReady?: () => void;

    // keepMounted: boolean;

    arrow: boolean;
    arrowSize: number;
    arrowInset: number | string;
    arrowShift: number | string;
};

export const PopoverConfigContext = createContext<PopoverConfigContextValue | null>(null);

export const usePopoverConfigContext = () => {
    const context = useContext(PopoverConfigContext);

    if (!context) {
        throw new Error('PopoverConfigContext not found');
    }

    return context;
};
