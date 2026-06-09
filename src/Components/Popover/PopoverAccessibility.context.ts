import { createContext, useContext } from 'react';

export type PopoverAccessibilityContextValue = {
    triggerId: string;
    panelId: string;

    role: 'dialog' | 'menu' | 'listbox';
};

export const PopoverAccessibilityContext = createContext<PopoverAccessibilityContextValue | null>(
    null,
);

export const usePopoverAccessibilityContext = () => {
    const context = useContext(PopoverAccessibilityContext);

    if (!context) {
        throw new Error('PopoverAccessibilityContext not found');
    }

    return context;
};
