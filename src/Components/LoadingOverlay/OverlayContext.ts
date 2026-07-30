import { createContext } from 'react';
import { ReactNode } from 'react';

export type OverlayOptions = {
  spinner?: ReactNode;
  children?: ReactNode;
};

export type OverlayContextValue = {
  show: (options?: OverlayOptions) => void;
  hide: () => void;
};

export const OverlayContext = createContext<OverlayContextValue | null>(null);
