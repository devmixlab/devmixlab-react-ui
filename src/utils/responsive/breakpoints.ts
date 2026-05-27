import { Breakpoint } from './types';

export const breakpoints: Record<Breakpoint, number> = {
    base: 0,
    '2xs': 360,
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export const breakpointOrder = ['base', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export const getActiveBreakpoint = (width: number): Breakpoint => {
    let active: Breakpoint = 'base';

    for (const bp of breakpointOrder) {
        if (width >= breakpoints[bp]) {
            active = bp;
        }
    }

    return active;
};
