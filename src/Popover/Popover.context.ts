import { createContext, useContext } from 'react';

import { useFloatingLayer } from '../hooks';
import { PopoverRole, PopoverSize } from './Popover';

type PopoverContextValue = {
    opened: boolean;
    setOpened: (value: boolean) => void;

    disabled?: boolean;
    popoverSize?: PopoverSize;
    role?: PopoverRole;

    refs: ReturnType<typeof useFloatingLayer>['refs'];

    floatingStyles: ReturnType<typeof useFloatingLayer>['floatingStyles'];

    getReferenceProps: ReturnType<typeof useFloatingLayer>['getReferenceProps'];

    getFloatingProps: ReturnType<typeof useFloatingLayer>['getFloatingProps'];

    triggerId: string;
    panelId: string;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
    const ctx = useContext(PopoverContext);

    if (!ctx) {
        throw new Error('Popover components must be used inside <Popover />');
    }

    return ctx;
};

export { PopoverContext, usePopoverContext };

export type { PopoverContextValue };
