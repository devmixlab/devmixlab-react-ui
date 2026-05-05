import React, { useContext, createContext } from 'react';
import { Size } from './Checkbox';

export type CheckboxGroupContextValue<T> = {
    value: T[];
    toggle: (val: T) => void;
    name?: string;
    disabled?: boolean;
    size?: Size;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue<unknown> | undefined>(
    undefined,
);

export function useCheckboxGroupContext<T>() {
    return useContext(CheckboxGroupContext) as CheckboxGroupContextValue<T> | undefined;
}

export const CheckboxGroupProvider = CheckboxGroupContext.Provider;
