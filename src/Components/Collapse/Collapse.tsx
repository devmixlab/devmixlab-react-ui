import React, {
    CSSProperties,
    forwardRef,
    HTMLAttributes,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import { clsx } from 'clsx';

import { Box, BoxProps } from '../Box';
import { usePresence, useReducedMotion } from '../../hooks';
import { classPrefix } from '../../utils/classPrefix';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--collapse${name}`);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CollapseEffect = 'none' | 'height';

type OwnCollapseProps = {
    /**
     * Whether collapse is open.
     */
    open?: boolean;

    /**
     * Transition duration (ms)
     */
    enterDuration?: number;
    exitDuration?: number;

    /**
     * Transition easing.
     */
    easing?: string;

    /**
     * Keep mounted after exit.
     */
    keepMounted?: boolean;

    /**
     * Animation effect.
     */
    effect?: CollapseEffect;

    onMount?: () => void;
    onUnmount?: () => void;
    onEntered?: () => void;
    onExited?: () => void;
};

type CollapseProps = OwnCollapseProps & BoxProps & HTMLAttributes<HTMLDivElement>;

// -----------------------------------------------------------------------------
// Collapse
// -----------------------------------------------------------------------------

const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
    (
        {
            children,
            className,
            style,

            open = false,
            enterDuration = 200,
            exitDuration = 200,
            easing = 'ease',
            keepMounted = false,
            effect = 'height',

            onMount,
            onUnmount,
            onEntered,
            onExited,

            ...rest
        },
        ref,
    ) => {
        const innerRef = useRef<HTMLDivElement>(null);

        const prefersReducedMotion = useReducedMotion();

        const shouldAnimate = effect === 'height' && !prefersReducedMotion;

        const { isMounted, state } = usePresence({
            present: open,
            enterDuration: shouldAnimate ? enterDuration : 0,
            exitDuration: shouldAnimate ? exitDuration : 0,
            onMount,
            onUnmount,
            onEntered,
            onExited,
        });

        // -----------------------------------------------------------------------------
        // Height state
        // -----------------------------------------------------------------------------

        const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

        const measure = () => innerRef.current?.scrollHeight ?? 0;

        // -----------------------------------------------------------------------------
        // Reduced motion / no animation
        // -----------------------------------------------------------------------------

        useLayoutEffect(() => {
            if (shouldAnimate) {
                return;
            }

            setHeight(open ? undefined : 0);
        }, [open, shouldAnimate]);

        // -----------------------------------------------------------------------------
        // Enter animation
        // -----------------------------------------------------------------------------

        useLayoutEffect(() => {
            if (!shouldAnimate) {
                return;
            }

            if (!isMounted || !open) {
                return;
            }

            const nextHeight = measure();

            // Start collapsed.
            setHeight(0);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setHeight(nextHeight);
                });
            });

            const timeout = window.setTimeout(() => {
                setHeight(undefined);
            }, enterDuration);

            return () => {
                window.clearTimeout(timeout);
            };
        }, [open, isMounted, enterDuration, shouldAnimate]);

        // -----------------------------------------------------------------------------
        // Exit animation
        // -----------------------------------------------------------------------------

        useLayoutEffect(() => {
            if (!shouldAnimate) {
                return;
            }

            if (!isMounted || open) {
                return;
            }

            const nextHeight = measure();

            setHeight(nextHeight);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setHeight(0);
                });
            });
        }, [open, isMounted, shouldAnimate]);

        // -----------------------------------------------------------------------------
        // Hidden
        // -----------------------------------------------------------------------------

        if (!keepMounted && !isMounted) {
            return null;
        }

        // -----------------------------------------------------------------------------
        // Render
        // -----------------------------------------------------------------------------

        return (
            <Box
                ref={ref}
                className={clsx(prefix(), className)}
                data-state={state}
                aria-hidden={state === 'exited'}
                inert={state === 'exited' ? true : undefined}
                h={height}
                {...rest}
                style={
                    {
                        ...style,

                        '--collapse-enter-duration': `${shouldAnimate ? enterDuration : 0}ms`,
                        '--collapse-exit-duration': `${shouldAnimate ? exitDuration : 0}ms`,
                        '--collapse-easing': easing,
                    } as CSSProperties
                }
            >
                <Box ref={innerRef} minH={0}>
                    {children}
                </Box>
            </Box>
        );
    },
);

Collapse.displayName = 'Collapse';

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export { Collapse };

export type { CollapseProps, CollapseEffect };
