import { createContext, useContext } from 'react';
import { Size } from './Radio';

export type radioGroupContextValue = {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    size?: Size;
};

const RadioGroupContext = createContext<radioGroupContextValue | undefined>(undefined);

export const useRadioGroup = () => useContext(RadioGroupContext);

export const RadioGroupProvider = RadioGroupContext.Provider;
