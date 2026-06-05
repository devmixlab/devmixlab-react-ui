import { createContext, useContext } from 'react';

export type SwitchGroupContextValue = {
    value: Record<string, boolean>;
    toggle: (name: string, next: boolean) => void;
    disabled?: boolean;
};

const SwitchGroupContext = createContext<SwitchGroupContextValue | undefined>(undefined);

export const useSwitchGroup = () => useContext(SwitchGroupContext);

export const SwitchGroupProvider = SwitchGroupContext.Provider;
