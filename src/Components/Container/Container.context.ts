import { createContext, useContext } from 'react';
import type { Responsiveify, Responsive } from '../../utils/responsive';
import type { ContainerSize } from './Container';

type ContainerContextValue = {
  size: Responsive<ContainerSize>;
  centered: boolean;

  setSize: (size: Responsive<ContainerSize>) => void;
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
