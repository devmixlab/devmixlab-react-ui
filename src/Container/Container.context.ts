import { createContext, useContext } from 'react';

import type { Responsiveify } from '../utils/responsive';

import type { ContainerSize } from './Container';

export type ContainerContextValue = Responsiveify<{
    size?: ContainerSize;
    centered?: boolean;
}>;

export const ContainerContext = createContext<ContainerContextValue>({});

export function useContainerContext() {
    return useContext(ContainerContext);
}
