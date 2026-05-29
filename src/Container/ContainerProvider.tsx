import { ReactNode } from 'react';

import { ContainerContext, ContainerContextValue } from './Container.context';

export type ContainerProviderProps = ContainerContextValue & {
    children: ReactNode;
};

export function ContainerProvider({ children, ...value }: ContainerProviderProps) {
    return <ContainerContext.Provider value={value}>{children}</ContainerContext.Provider>;
}
