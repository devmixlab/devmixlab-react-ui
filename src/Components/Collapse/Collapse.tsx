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
    enterEasing?: string;
    exitEasing?: string;

    /**
     * Keep mounted after exit.
     */
    keepMounted?: boolean;

    reduceMotion?: boolean;

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
            enterDuration = 250,
            exitDuration = 200,
            enterEasing = 'cubic-bezier(0.25, 1, 0.5, 1)',
            exitEasing = 'cubic-bezier(0.4, 0, 1, 1)',
            keepMounted = false,
            reduceMotion: reduceMotionProp,

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

        const reduceMotion = reduceMotionProp ?? prefersReducedMotion;

        const { isMounted, state } = usePresence({
            present: open,
            reduceMotion,
            enterDuration,
            exitDuration,
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
            if (!reduceMotion) {
                return;
            }

            setHeight(open ? undefined : 0);
        }, [open, reduceMotion]);

        // -----------------------------------------------------------------------------
        // Enter animation
        // -----------------------------------------------------------------------------

        useLayoutEffect(() => {
            if (reduceMotion) {
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
        }, [open, reduceMotion, isMounted, enterDuration]);

        // -----------------------------------------------------------------------------
        // Exit animation
        // -----------------------------------------------------------------------------

        useLayoutEffect(() => {
            if (reduceMotion) {
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
        }, [open, reduceMotion, isMounted]);

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
                {...rest}
                ref={ref}
                className={clsx(prefix(), className)}
                data-state={state}
                aria-hidden={state === 'exited'}
                inert={state === 'exited' ? true : undefined}
                h={height}
                style={
                    {
                        ...style,

                        '--collapse-enter-duration': `${reduceMotion ? 0 : enterDuration}ms`,
                        '--collapse-exit-duration': `${reduceMotion ? 0 : exitDuration}ms`,
                        '--collapse-enter-easing': enterEasing,
                        '--collapse-exit-easing': exitEasing,
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

export type { CollapseProps, OwnCollapseProps };
