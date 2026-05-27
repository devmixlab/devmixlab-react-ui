import { PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { WindowSizeContext } from './ResponsiveContext';

const getWidth = () => (typeof window === 'undefined' ? 0 : window.innerWidth);

export const WindowSizeProvider = ({ children }: PropsWithChildren) => {
    const [width, setWidth] = useState(getWidth);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        let frame = 0;

        const handleResize = () => {
            cancelAnimationFrame(frame);

            frame = requestAnimationFrame(() => {
                setWidth((prev) => {
                    const next = window.innerWidth;

                    return prev === next ? prev : next;
                });
            });
        };

        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            cancelAnimationFrame(frame);

            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const value = useMemo(() => {
        return { width };
    }, [width]);

    return <WindowSizeContext.Provider value={value}>{children}</WindowSizeContext.Provider>;
};
