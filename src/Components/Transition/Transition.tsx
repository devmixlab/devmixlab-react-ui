import React, {
    CSSProperties,
    forwardRef,
    HTMLAttributes,
    useImperativeHandle,
    useState,
    useEffect,
    useRef,
} from 'react';

import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';
import { Box, BoxProps } from '../Box';
import { usePresence } from '../../hooks';
import { createPolymorphic } from '../../types/polymorphic';
import { defineExactKeys } from '../../types/tuple';
import { useReducedMotion } from '../../hooks';

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

type TransitionAttention = (typeof transitionAttentions)[number] | (string & {});

interface TransitionControlRef {
    runAttention(attention?: TransitionAttention, force?: boolean): void;
}

const attentionDurations: Record<TransitionAttention, number> = {
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
    'fade',
    'slide-down',
    'slide-up',
    'slide-left',
    'slide-right',
    'scale',
    'scale-fade',

    'blur',
    'blur-fade',
    'scale-blur',
] as const;

type TransitionAnimation = (typeof transitionAnimations)[number] | (string & {});

type TransitionHiddenStrategy = 'display' | 'visibility' | 'none';

type SharedTransitionProps = {
    controlRef?: React.Ref<TransitionControlRef>;

    animateOnMount?: boolean;

    hiddenStrategy?: TransitionHiddenStrategy;

    animation?: TransitionAnimation;
    attention?: TransitionAttention;
    attentionExit?: TransitionAnimation;

    respectAttentionDuration?: boolean;

    reduceMotion?: boolean;

    /**
     * Enables only presence lifecycle management.
     *
     * The component still transitions through:
     * entering → entered → exiting → exited
     *
     * but Transition will not apply visual animations,
     * attention effects, or motion-related behavior.
     *
     * Useful when a parent component provides its own
     * animation system and only needs mount/unmount
     * coordination from Transition.
     *
     * @default false
     */
    onlyPresence?: boolean;

    enterDuration?: number;
    exitDuration?: number;

    enterEasing?: string;
    exitEasing?: string;

    keepMounted?: boolean;

    onEntered?: () => void;
    onExited?: () => void;

    onMount?: () => void;
    onUnmount?: () => void;

    slideOffset?: string | number;
    scaleFrom?: number;
    blurFrom?: string | number;
};

const sharedTransitionProps = defineExactKeys<SharedTransitionProps>()([
    'controlRef',
    'animateOnMount',
    'hiddenStrategy',
    'animation',
    'attention',
    'attentionExit',
    'respectAttentionDuration',
    'reduceMotion',
    'onlyPresence',
    'enterDuration',
    'exitDuration',
    'enterEasing',
    'exitEasing',
    'keepMounted',
    'onEntered',
    'onExited',
    'onMount',
    'onUnmount',
    'slideOffset',
    'scaleFrom',
    'blurFrom',
]);

type OwnTransitionProps = {
    visible: boolean;
} & SharedTransitionProps;

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

        visible,
        animateOnMount = true,
        hiddenStrategy = 'none',

        animation = 'scale-fade',
        attention,
        attentionExit,

        enterDuration: enterDurationProp,
        exitDuration = 120,

        respectAttentionDuration,
        reduceMotion: reduceMotionProp,

        enterEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
        exitEasing = 'cubic-bezier(0.4, 0, 1, 1)',

        keepMounted = false,

        onEntered,
        onExited,

        onMount,
        onUnmount,

        slideOffset,
        scaleFrom,
        blurFrom,

        ...rest
    }: ImplTransitionProps,
    ref: React.Ref<HTMLDivElement>,
) => {
    const prefersReducedMotion = useReducedMotion();
    const initialRender = useRef(true);
    const [runningAttention, setRunningAttention] = useState<TransitionAttention | undefined>();

    const defaultEnterDuration = attention ? attentionDurations[attention] : DEFAULT_ENTER_DURATION;

    const enterDuration =
        attention && respectAttentionDuration
            ? attentionDurations[attention]
            : (enterDurationProp ?? defaultEnterDuration);

    const reduceMotion =
        initialRender.current && !animateOnMount
            ? true
            : (reduceMotionProp ?? prefersReducedMotion);

    useEffect(() => {
        setRunningAttention(undefined);
    }, [visible]);

    useImperativeHandle(
        controlRef,
        () => ({
            runAttention(nextAttention, force = false) {
                if (reduceMotion && !force) {
                    return;
                }

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
        [attention, reduceMotion],
    );

    const { isMounted, state } = usePresence({
        present: visible,
        reduceMotion,
        enterDuration,
        exitDuration,
        onEntered: () => {
            onEntered?.();

            if (initialRender.current) {
                initialRender.current = false;
            }
        },
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
            data-attention={attention && !reduceMotion ? attention : undefined}
            data-attention-exit={attentionExit ?? undefined}
            data-running-attention={runningAttention ?? undefined}
            data-hidden-strategy={hiddenStrategy}
            aria-hidden={state === 'exited'}
            inert={state === 'exited' ? true : undefined}
            style={
                {
                    ...style,

                    '--animation-enter-duration': `${enterDuration}ms`,
                    '--animation-exit-duration': `${exitDuration}ms`,
                    '--animation-enter-easing': enterEasing,
                    '--animation-exit-easing': exitEasing,

                    '--running-attention-duration': runningAttention
                        ? `${attentionDurations[runningAttention]}ms`
                        : undefined,

                    '--transition-slide-offset':
                        typeof slideOffset === 'number' ? `${slideOffset}px` : slideOffset,
                    '--transition-scale-from': scaleFrom,
                    '--transition-blur-from':
                        typeof blurFrom === 'number' ? `${blurFrom}px` : blurFrom,
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

export type {
    TransitionProps,
    TransitionAnimation,
    TransitionAttention,
    TransitionControlRef,
    SharedTransitionProps,
};

export { transitionAttentions, transitionAnimations, sharedTransitionProps };
