import { createContext, useContext } from 'react';
import { Size } from './Radio';

export type radioGroupContextValue<T> = {
  value?: T | null;
  name?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  size?: Size;
  readOnly?: boolean;
};

const RadioGroupContext = createContext<radioGroupContextValue<unknown> | undefined>(undefined);

export const useRadioGroup = () => useContext(RadioGroupContext);

export const RadioGroupProvider = RadioGroupContext.Provider;
