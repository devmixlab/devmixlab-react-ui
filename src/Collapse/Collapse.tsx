import React, { CSSProperties, forwardRef, useLayoutEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { usePresence, useReducedMotion } from '../hooks';
import { classPrefix } from '../utils/classPrefix';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--collapse${name}`);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CollapseEffect = 'none' | 'height' | 'fade' | 'scale' | 'slide' | (string & {});

export type CollapseProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        open?: boolean;

        orientation?: 'vertical' | 'horizontal';

        enterDuration?: number;
        exitDuration?: number;

        easing?: string;

        keepMounted?: boolean;

        effect?: CollapseEffect;
    }
>;

// -----------------------------------------------------------------------------
// Collapse
// -----------------------------------------------------------------------------

const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
    (
        {
            open = false,
            orientation = 'horizontal',
            enterDuration = 200,
            exitDuration = 200,
            easing = 'ease',
            keepMounted = false,
            effect = 'height',
            children,
            className,
            ...rest
        },
        ref,
    ) => {
        const innerRef = useRef<HTMLDivElement>(null);

        const prefersReducedMotion = useReducedMotion();

        const shouldAnimate = effect !== 'none' && !prefersReducedMotion;

        const { isMounted, state } = usePresence({
            present: open,
            enterDuration,
            exitDuration,
        });

        const [size, setSize] = useState<number | 'auto'>(open ? 'auto' : 0);

        // ---------------------------------------------------------------------
        // Measure
        // ---------------------------------------------------------------------

        const measure = () => {
            if (!innerRef.current) {
                return 0;
            }

            return orientation === 'horizontal'
                ? innerRef.current.scrollWidth
                : innerRef.current.scrollHeight;
        };

        // ---------------------------------------------------------------------
        // Reduced motion
        // ---------------------------------------------------------------------

        useLayoutEffect(() => {
            if (effect !== 'height') {
                return;
            }

            if (shouldAnimate) {
                return;
            }

            setSize(open ? 'auto' : 0);
        }, [open, effect, shouldAnimate]);

        // ---------------------------------------------------------------------
        // Height animation only
        // ---------------------------------------------------------------------

        useLayoutEffect(() => {
            if (!shouldAnimate) {
                return;
            }

            if (effect !== 'height' || !isMounted || !open) {
                return;
            }

            const nextSize = measure();

            requestAnimationFrame(() => {
                setSize(nextSize);

                // Width animations do not transition cleanly to `auto`.
                // Keep measured width for horizontal collapse.
                if (orientation === 'horizontal') {
                    return;
                }

                const timeout = window.setTimeout(() => {
                    setSize('auto');
                }, enterDuration);

                return () => {
                    window.clearTimeout(timeout);
                };
            });

            // requestAnimationFrame(() => {
            //     setSize(nextSize);
            //
            //     const timeout = window.setTimeout(() => {
            //         setSize('auto');
            //     }, enterDuration);
            //
            //     return () => {
            //         window.clearTimeout(timeout);
            //     };
            // });
        }, [open, isMounted, enterDuration, effect, shouldAnimate, orientation]);

        useLayoutEffect(() => {
            if (!shouldAnimate) {
                return;
            }

            if (effect !== 'height' || !isMounted || open) {
                return;
            }

            const nextSize = measure();

            setSize(nextSize);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setSize(0);
                });
            });
        }, [open, isMounted, effect, shouldAnimate, orientation]);

        // ---------------------------------------------------------------------
        // Hidden
        // ---------------------------------------------------------------------

        if (!keepMounted && !isMounted) {
            return null;
        }

        // ---------------------------------------------------------------------
        // Render
        // ---------------------------------------------------------------------

        return (
            <Box
                ref={ref}
                className={clsx(prefix(), className)}
                data-state={state}
                data-animation-effect={effect}
                data-orientation={orientation}
                aria-hidden={state === 'exited'}
                h={effect === 'height' && orientation === 'vertical' ? size : undefined}
                w={effect === 'height' && orientation === 'horizontal' ? size : undefined}
                {...rest}
                inert={state === 'exited' ? true : undefined}
                style={
                    {
                        '--collapse-enter-duration': `${!shouldAnimate ? 0 : enterDuration}ms`,
                        '--collapse-exit-duration': `${!shouldAnimate ? 0 : exitDuration}ms`,
                        '--collapse-easing': easing,
                    } as CSSProperties
                }
            >
                <Box ref={innerRef}>{children}</Box>
            </Box>
        );
    },
);

Collapse.displayName = 'Collapse';

export { Collapse };
