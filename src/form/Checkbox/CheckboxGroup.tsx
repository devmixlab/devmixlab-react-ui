// CheckboxGroup.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { CheckboxGroupProvider } from './checkboxGroup.context';

export type Value = string | number;

type CheckboxGroupProps = {
    value?: Value[];
    defaultValue?: Value[];
    onChange?: (values: Value[]) => void;
    name?: string;
    disabled?: boolean;
    children: React.ReactNode;
};

export const CheckboxGroup = ({
    value,
    defaultValue = [],
    onChange,
    name,
    disabled,
    children,
}: CheckboxGroupProps) => {
    const isControlled = Array.isArray(value);
    const [inner, setInner] = useState<Value[]>(() => defaultValue);

    const current = isControlled ? value! : inner;

    const toggle = useCallback(
        (val: Value) => {
            const exists = current.includes(val);

            const next = exists ? current.filter((v) => v !== val) : [...current, val];

            if (!isControlled) {
                setInner(next);
            }

            onChange?.(next);
        },
        [current, isControlled, onChange],
    );

    const ctx = useMemo(
        () => ({ value: current, toggle, name, disabled }),
        [current, toggle, name, disabled],
    );

    return (
        <CheckboxGroupProvider value={ctx}>
            <div role="group" {...(name ? { 'aria-label': name } : {})}>
                {children}
            </div>
        </CheckboxGroupProvider>
    );
};
