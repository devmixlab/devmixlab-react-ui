import React, {
    CSSProperties,
    forwardRef,
    HTMLAttributes,
    useImperativeHandle,
    useState,
    useEffect,
} from 'react';

import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';
import { Box, BoxProps } from '../Box';
import { usePresence } from '../../hooks';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { AlertAnimation, AlertAttention, AlertControlRef } from '../Alert/____Alert';

//-----------------------------------------------------------
// Types
//-----------------------------------------------------------

const transitionAttentions = [
    'shake',
    'pulse',
    'bounce',
    'wiggle',
    'flash',
    'heartbeat',
    'jello',
    'rubber-band',
    'swing',
    'tada',
    'blink',
    'flicker',
    'vibrate',
    'pop',
    'tilt',
    'compress',
    'nudge',
    'breathe',
    'lift',
    'rock',
    'throb',
] as const;

type TransitionAttention = (typeof transitionAttentions)[number];

interface TransitionControlRef {
    runAttention(attention?: TransitionAttention): void;
}

const attentionDurations: Record<AlertAttention, number> = {
    shake: 500,
    pulse: 500,
    bounce: 500,
    wiggle: 500,
    flash: 500,
    heartbeat: 900,
    jello: 800,
    'rubber-band': 750,
    swing: 700,
    tada: 900,
    blink: 400,
    flicker: 600,
    vibrate: 400,
    pop: 400,
    tilt: 600,
    compress: 500,
    nudge: 500,
    breathe: 1200,
    lift: 550,
    rock: 700,
    throb: 650,
};

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
    controlRef?: React.Ref<AlertControlRef>;

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    animation?: TransitionAnimation;
    attention?: TransitionAttention;
    attentionExit?: AlertAnimation;

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

const DEFAULT_ENTER_DURATION = 120;

//-----------------------------------------------------------
// Helpers
//-----------------------------------------------------------

export const prefix = (name: string = '') => {
    return classPrefix(`--transition${name}`);
};

//-----------------------------------------------------------
// Component
//-----------------------------------------------------------
const ImplTransition = (
    {
        children,
        className,
        style,

        controlRef,

        open,
        defaultOpen = true,
        onOpenChange,

        animation = 'scale-fade',
        attention,
        attentionExit,

        enterDuration: enterDurationProp,
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
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const [runningAttention, setRunningAttention] = useState<TransitionAttention | undefined>();

    const isControlled = open !== undefined;
    const visible = isControlled ? open : internalOpen;

    const defaultEnterDuration = attention ? attentionDurations[attention] : DEFAULT_ENTER_DURATION;

    const enterDuration = enterDurationProp ?? defaultEnterDuration;

    useEffect(() => {
        setRunningAttention(undefined);
    }, [visible]);

    useImperativeHandle(
        controlRef,
        () => ({
            runAttention(nextAttention) {
                const resolvedAttention = nextAttention ?? attention;

                if (!resolvedAttention) {
                    return;
                }

                setRunningAttention(undefined);

                requestAnimationFrame(() => {
                    setRunningAttention(resolvedAttention);
                });
            },
        }),
        [attention],
    );

    const { isMounted, state } = usePresence({
        present: visible,
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
            className={clsx(prefix(), className)}
            data-animation={animation}
            data-animation-state={state}
            data-attention={attention ?? undefined}
            data-attention-exit={attentionExit ?? undefined}
            data-running-attention={runningAttention}
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
            onAnimationEnd={(e) => {
                if (runningAttention && e.animationName === `transition-${runningAttention}`) {
                    setRunningAttention(undefined);
                }
            }}
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

export type { TransitionProps, TransitionAnimation, TransitionAttention, TransitionControlRef };

export { transitionAttentions, transitionAnimations };
