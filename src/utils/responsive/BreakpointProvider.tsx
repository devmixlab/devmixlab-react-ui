import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { breakpointOrder, breakpoints, getActiveBreakpoint } from './breakpoints';

import { BreakpointContext } from './ResponsiveContext';

const getWidth = () => (typeof window === 'undefined' ? 0 : window.innerWidth);

export const BreakpointProvider = ({ children }: PropsWithChildren) => {
    const [breakpoint, setBreakpoint] = useState(() => getActiveBreakpoint(getWidth()));

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQueries = breakpointOrder.map((bp) => {
            return window.matchMedia(`(min-width: ${breakpoints[bp]}px)`);
        });

        const update = () => {
            setBreakpoint((prev) => {
                const next = getActiveBreakpoint(window.innerWidth);

                return prev === next ? prev : next;
            });
        };

        update();

        mediaQueries.forEach((mq) => {
            mq.addEventListener('change', update);
        });

        return () => {
            mediaQueries.forEach((mq) => {
                mq.removeEventListener('change', update);
            });
        };
    }, []);

    const value = useMemo(() => {
        return { breakpoint };
    }, [breakpoint]);

    return <BreakpointContext.Provider value={value}>{children}</BreakpointContext.Provider>;
};
