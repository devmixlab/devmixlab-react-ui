import React from 'react';
import { RadioGroupProvider } from './radioGroup.context';
import { Size } from './Radio';

type RadioGroupProps = {
    value?: string | null;
    name?: string;
    size?: Size;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
    readOnly?: boolean;
};

const RadioGroup = ({
    value,
    name,
    size,
    onValueChange,
    children,
    disabled,
    readOnly,
}: RadioGroupProps) => {
    return (
        <RadioGroupProvider value={{ value, name, size, onValueChange, disabled, readOnly }}>
            <div role="radiogroup">{children}</div>
        </RadioGroupProvider>
    );
};

export { RadioGroup };

export type { RadioGroupProps };
