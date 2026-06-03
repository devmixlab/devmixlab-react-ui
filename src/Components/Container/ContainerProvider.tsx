import { ReactNode } from 'react';

import { ContainerContext, ContainerContextValue } from './Container.context';

type ContainerProviderProps = ContainerContextValue & {
    children: ReactNode;
};

function ContainerProvider({ children, ...value }: ContainerProviderProps) {
    return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>;
}

export { ContainerProvider };

export type { ContainerProviderProps };
