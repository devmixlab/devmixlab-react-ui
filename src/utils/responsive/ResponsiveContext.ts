import { createContext } from 'react';

import { Breakpoint } from './types';

export type BreakpointContextValue = {
    breakpoint: Breakpoint;
};

export type WindowSizeContextValue = {
    width: number;
};

export const BreakpointContext = createContext<BreakpointContextValue | null>(null);

export const WindowSizeContext = createContext<WindowSizeContextValue | null>(null);

BreakpointContext.displayName = 'BreakpointContext';

WindowSizeContext.displayName = 'WindowSizeContext';
