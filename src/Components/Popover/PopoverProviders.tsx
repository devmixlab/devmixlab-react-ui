import React from 'react';
import { PopoverStateContext, PopoverStateContextValue } from './PopoverState.context';
import {
    PopoverInteractionContext,
    PopoverInteractionContextValue,
} from './PopoverInteraction.context';
import { PopoverFloatingContext, PopoverFloatingContextValue } from './PopoverFloating.context';
import {
    PopoverAccessibilityContext,
    PopoverAccessibilityContextValue,
} from './PopoverAccessibility.context';
import { PopoverConfigContext, PopoverConfigContextValue } from './PopoverConfig.context';
import {
    PopoverTransitionContext,
    PopoverTransitionContextValue,
} from './PopoverTransition.context';

type PopoverProvidersProps = {
    children: React.ReactNode;

    state: PopoverStateContextValue;
    interaction: PopoverInteractionContextValue;
    floating: PopoverFloatingContextValue;
    accessibility: PopoverAccessibilityContextValue;
    config: PopoverConfigContextValue;
    transition: PopoverTransitionContextValue;
};

export const PopoverProviders = ({
    children,

    state,
    interaction,
    floating,
    accessibility,
    config,
    transition,
}: PopoverProvidersProps) => {
    return (
        <PopoverStateContext.Provider value={state}>
            <PopoverFloatingContext.Provider value={floating}>
                <PopoverInteractionContext.Provider value={interaction}>
                    <PopoverAccessibilityContext.Provider value={accessibility}>
                        <PopoverConfigContext.Provider value={config}>
                            <PopoverTransitionContext.Provider value={transition}>
                                {children}
                            </PopoverTransitionContext.Provider>
                        </PopoverConfigContext.Provider>
                    </PopoverAccessibilityContext.Provider>
                </PopoverInteractionContext.Provider>
            </PopoverFloatingContext.Provider>
        </PopoverStateContext.Provider>
    );
};
