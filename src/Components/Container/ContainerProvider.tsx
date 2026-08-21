import { ReactNode, useState, useEffect } from 'react';

import { ContainerContext, ContainerContextValue } from './Container.context';
import type { ContainerSize } from './Container';

type ContainerProviderProps = ContainerContextValue & {
  children: ReactNode;
};

import { Responsive } from '../../utils/responsive';

function ContainerProvider({
  children,
  size: initialSize = 'full',
  responsiveSize: initialResponsiveSize,
  centered = true,
}: ContainerProviderProps) {
  const [size, setSize] = useState<ContainerSize>(initialSize);
  const [responsiveSize, setResponsiveSize] = useState<Responsive<ContainerSize> | undefined>(
    initialResponsiveSize,
  );

  useEffect(() => {
    console.log('size: ', size);
  }, [size]);

  return (
    <ContainerContext.Provider
      value={{
        size,
        setSize,
        centered,
        responsiveSize,
        setResponsiveSize,
      }}
    >
      {children}
    </ContainerContext.Provider>
  );
}

export { ContainerProvider };

export type { ContainerProviderProps };
