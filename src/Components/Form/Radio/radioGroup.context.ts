import { createContext, useContext } from 'react';
import { Size } from './Radio';

export type radioGroupContextValue = {
    value?: string | null;
    name?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    size?: Size;
    readOnly?: boolean;
};

const RadioGroupContext = createContext<radioGroupContextValue | undefined>(undefined);

export const useRadioGroup = () => useContext(RadioGroupContext);

export const RadioGroupProvider = RadioGroupContext.Provider;
