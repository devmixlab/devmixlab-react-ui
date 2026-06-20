import { createContext, useContext } from 'react';
import { SharedTransitionProps } from '../Transition';

export type PopoverTransitionContextValue = Partial<SharedTransitionProps>;

export const PopoverTransitionContext = createContext<PopoverTransitionContextValue | null>(null);

export const usePopoverTransitionContext = () => {
    const context = useContext(PopoverTransitionContext);

    if (!context) {
        throw new Error('PopoverTransitionContext not found');
    }

    return context;
};
