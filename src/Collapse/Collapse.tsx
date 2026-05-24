import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { usePresence } from '../hooks';
import { classPrefix } from '../utils/classPrefix';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--collapse${name}`);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type CollapseProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        /**
         * Whether collapse is open
         */
        open?: boolean;

        /**
         * Transition duration (ms)
         */
        duration?: number;

        /**
         * Keep mounted after exit
         */
        keepMounted?: boolean;
    }
>;

// -----------------------------------------------------------------------------
// Collapse
// -----------------------------------------------------------------------------

const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
    (
        { open = false, duration = 200, keepMounted = false, children, className, style, ...rest },
        ref,
    ) => {
        const innerRef = useRef<HTMLDivElement>(null);

        const { isMounted, state } = usePresence({
            present: open,
            enterDuration: duration,
            exitDuration: duration,
        });

        const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);

        // ---------------------------------------------------------------------
        // Measure
        // ---------------------------------------------------------------------

        const measure = () => {
            if (!innerRef.current) {
                return 0;
            }

            return innerRef.current.scrollHeight;
        };

        // ---------------------------------------------------------------------
        // Enter
        // ---------------------------------------------------------------------

        useLayoutEffect(() => {
            if (!isMounted || !open) {
                return;
            }

            const nextHeight = measure();

            // start from 0
            setHeight(0);

            requestAnimationFrame(() => {
                setHeight(nextHeight);

                window.setTimeout(() => {
                    setHeight('auto');
                }, duration);
            });
        }, [open, isMounted, duration]);

        // ---------------------------------------------------------------------
        // Exit
        // ---------------------------------------------------------------------

        useEffect(() => {
            if (!isMounted || open) {
                return;
            }

            const nextHeight = measure();

            // lock current height first
            setHeight(nextHeight);

            requestAnimationFrame(() => {
                setHeight(0);
            });
        }, [open, isMounted]);

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
                aria-hidden={state === 'exited'}
                h={height}
                style={{
                    // overflow: 'hidden',
                    // height,
                    transition: `height ${duration}ms ease`,
                    ...style,
                }}
                {...rest}
            >
                <Box ref={innerRef}>{children}</Box>
            </Box>
        );
    },
);

Collapse.displayName = 'Collapse';

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export { Collapse };
