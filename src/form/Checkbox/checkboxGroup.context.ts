// CheckboxGroup.context.ts
import React, { useContext } from 'react';
import { Value } from './CheckboxGroup';

export type CheckboxGroupContextValue = {
    value: Value[];
    toggle: (val: Value) => void;
    name?: string;
    disabled?: boolean;
};

const CheckboxGroupContext = React.createContext<CheckboxGroupContextValue | undefined>(undefined);

export const useCheckboxGroupContext = (): CheckboxGroupContextValue | undefined => {
    const context = useContext(CheckboxGroupContext);
    // if (!context) {
    //     throw new Error('CheckboxGroupContextValue must be used within a <Checkbox.Provider>');
    // }
    return context;
};

export const CheckboxGroupProvider = CheckboxGroupContext.Provider;
