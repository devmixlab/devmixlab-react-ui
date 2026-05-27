import { useMemo } from 'react';

import { Responsive } from './types';

import { useBreakpoint } from './useBreakpoint';

import { resolveResponsive } from './resolveResponsive';

export const useResponsive = <T>(value: Responsive<T | undefined> | undefined) => {
    const { breakpoint } = useBreakpoint();

    return useMemo(() => {
        return resolveResponsive(value, breakpoint);
    }, [value, breakpoint]);
};
