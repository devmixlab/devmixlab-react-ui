import { createContext, useContext } from 'react';

import { useFloatingLayer } from '../../hooks';
import { PresenceState } from '../../hooks/usePresence';
import {
    BackdropVariant,
    PopoverAnimation,
    PopoverRole,
    PopoverVariant,
    PopoverTriggerMode,
} from './Popover';
import type { Placement } from '@floating-ui/react';

type PopoverContextValue = {
    opened: boolean;
    setOpened: (value: boolean) => void;

    placement: Placement;

    disabled?: boolean;
    role?: PopoverRole;

    variant: PopoverVariant;
    animation: PopoverAnimation;
    animationEnterDuration: number;
    animationExitDuration: number;
    enterAnimationEasing: string;
    exitAnimationEasing: string;

    trigger: PopoverTriggerMode;
    openDelay: number;
    closeDelay: number;
    handleHoverEnter: () => void;
    handleHoverLeave: () => void;

    context: ReturnType<typeof useFloatingLayer>['context'];
    refs: ReturnType<typeof useFloatingLayer>['refs'];

    floatingStyles: ReturnType<typeof useFloatingLayer>['floatingStyles'];

    getReferenceProps: ReturnType<typeof useFloatingLayer>['getReferenceProps'];

    getFloatingProps: ReturnType<typeof useFloatingLayer>['getFloatingProps'];

    triggerId: string;
    panelId: string;

    modal: boolean;
    backdrop: boolean;
    backdropVariant: BackdropVariant;
    closeOnOutsideClick: boolean;
    returnFocus: boolean;

    isMounted: boolean;
    animationState: PresenceState;

    onReady?: () => void;

    keepMounted: boolean;
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
