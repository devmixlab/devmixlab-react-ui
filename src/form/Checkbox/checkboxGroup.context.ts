// CheckboxGroup.context.ts
import React, { useContext, createContext } from 'react';

export type CheckboxGroupContextValue<T> = {
    value: T[];
    toggle: (val: T) => void;
    name?: string;
    disabled?: boolean;
};

const CheckboxGroupContext = createContext<CheckboxGroupContextValue<any> | undefined>(undefined);

// const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(undefined);

// export const useCheckboxGroupContext = (): CheckboxGroupContextValue | undefined => {
//     const context = useContext(CheckboxGroupContext);
//     // if (!context) {
//     //     throw new Error('CheckboxGroupContextValue must be used within a <Checkbox.Provider>');
//     // }
//     return context;
// };
export function useCheckboxGroupContext<T>() {
    return useContext(CheckboxGroupContext) as CheckboxGroupContextValue<T> | undefined;
}

export const CheckboxGroupProvider = CheckboxGroupContext.Provider;
