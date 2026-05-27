import { PropsWithChildren } from 'react';

import { BreakpointProvider } from './BreakpointProvider';

import { WindowSizeProvider } from './WindowSizeProvider';

export const ResponsiveProvider = ({ children }: PropsWithChildren) => {
    return (
        <BreakpointProvider>
            <WindowSizeProvider>{children}</WindowSizeProvider>
        </BreakpointProvider>
    );
};
