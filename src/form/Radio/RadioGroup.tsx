import React from 'react';
import { RadioGroupProvider } from './radioGroup.context';
import { Size } from './Radio';

type RadioGroupProps = {
    value?: string;
    size?: Size;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
};

export const RadioGroup = ({ value, size, onValueChange, children, disabled }: RadioGroupProps) => {
    return (
        <RadioGroupProvider value={{ value, size, onValueChange, disabled }}>
            <div role="radiogroup">{children}</div>
        </RadioGroupProvider>
    );
};
