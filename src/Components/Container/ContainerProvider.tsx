import { ReactNode, useState } from 'react';

import { ContainerContext, ContainerContextValue } from './Container.context';
import type { ContainerSize } from './Container';

type ContainerProviderProps = ContainerContextValue & {
  children: ReactNode;
};

import { Responsive } from '../../utils/responsive';

function ContainerProvider({
  children,
  size: initialSize = 'full',
  centered = true,
}: ContainerProviderProps) {
  const [size, setSize] = useState<Responsive<ContainerSize>>(initialSize);

  return (
    <ContainerContext.Provider
      value={{
        size,
        centered,
        setSize,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
}

export { ContainerProvider };

export type { ContainerProviderProps };
