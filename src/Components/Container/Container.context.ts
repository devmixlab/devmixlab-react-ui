import { createContext, useContext } from 'react';
import type { Responsiveify, Responsive } from '../../utils/responsive';
import type { ContainerSize } from './Container';

type ContainerContextValue = {
  size: ContainerSize;
  setSize: (size: ContainerSize) => void;

  centered: boolean;

  responsiveSize?: Responsive<ContainerSize>;
  setResponsiveSize: (size: Responsive<ContainerSize>) => void;
};

const ContainerContext = createContext<ContainerContextValue | null>(null);

function useContainerContext() {
  // return useContext(ContainerContext);
  const context = useContext(ContainerContext);

  if (!context) {
    throw new Error('useContainerContext must be used within ContainerProvider.');
  }

  return context;
}

export { ContainerContext, useContainerContext };

export type { ContainerContextValue };
