import { createContext, useContext } from 'react';
import type { Responsiveify } from '../../utils/responsive';
import type { ContainerSize } from './Container';

type ContainerContextValue = Responsiveify<{
  size?: ContainerSize;
  centered?: boolean;

  setSize: (size?: ContainerSize) => void;
}>;

const ContainerContext = createContext<ContainerContextValue>({});

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
