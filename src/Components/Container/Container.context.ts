import { createContext, useContext } from 'react';
import type { Responsiveify } from '../../utils/responsive';
import type { ContainerSize } from './Container';

type ContainerContextValue = Responsiveify<{
    size?: ContainerSize;
    centered?: boolean;
}>;

const ContainerContext = createContext<ContainerContextValue>({});

function useContainerContext() {
    return useContext(ContainerContext);
}

export { ContainerContext, useContainerContext };

export type { ContainerContextValue };
