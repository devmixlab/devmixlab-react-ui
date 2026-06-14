import React, { CSSProperties, forwardRef, HTMLAttributes } from 'react';

import clsx from 'clsx';

import { Box, BoxProps } from '../Box';
import { usePresence } from '../../hooks';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';

//-----------------------------------------------------------
// Types
//-----------------------------------------------------------
const transitionAnimations = [
    'none',
    'fade',
    'slide-down',
    'slide-up',
    'slide-left',
    'slide-right',
    'scale',
    'scale-fade',
] as const;

type TransitionAnimation = (typeof transitionAnimations)[number];

type OwnTransitionProps = {
    open?: boolean;

    animation?: TransitionAnimation;

    enterDuration?: number;
    exitDuration?: number;

    enterEasing?: string;
    exitEasing?: string;

    keepMounted?: boolean;

    onEntered?: () => void;
    onExited?: () => void;

    onMount?: () => void;
    onUnmount?: () => void;
};

type TransitionProps = OwnTransitionProps;

type ImplTransitionProps = TransitionProps & BoxProps & HTMLAttributes<HTMLDivElement>;

//-----------------------------------------------------------
// Component
//-----------------------------------------------------------
const ImplTransition = (
    {
        children,
        className,
        style,

        open = true,
        animation = 'fade',

        enterDuration = 120,
        exitDuration = 120,

        enterEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
        exitEasing = 'cubic-bezier(0.4, 0, 1, 1)',

        keepMounted = false,

        onEntered,
        onExited,

        onMount,
        onUnmount,

        ...rest
    }: ImplTransitionProps,
    ref: React.Ref<any>,
) => {
    const { isMounted, state } = usePresence({
        present: open,
        enterDuration: animation === 'none' ? 0 : enterDuration,
        exitDuration: animation === 'none' ? 0 : exitDuration,
        onEntered,
        onExited,
        onMount,
        onUnmount,
    });

    if (!keepMounted && !isMounted) {
        return null;
    }

    return (
        <Box
            {...rest}
            ref={ref}
            className={clsx(className)}
            data-animation={animation}
            data-animation-state={state}
            aria-hidden={state === 'exited'}
            inert={state === 'exited' ? true : undefined}
            style={
                {
                    ...style,

                    '--animation-enter-duration': `${enterDuration}ms`,
                    '--animation-exit-duration': `${exitDuration}ms`,
                    '--animation-enter-easing': enterEasing,
                    '--animation-exit-easing': exitEasing,
                } as CSSProperties
            }
        >
            {children}
        </Box>
    );
};

const Transition = createPolymorphic<TransitionProps, 'div'>(
    forwardRef(ImplTransition),
    'Transition',
);

//-----------------------------------------------------------
// Exports
//-----------------------------------------------------------

export { Transition };

export type { TransitionProps, TransitionAnimation };

export { transitionAnimations };
