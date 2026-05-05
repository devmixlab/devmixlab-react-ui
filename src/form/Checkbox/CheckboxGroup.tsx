import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { CheckboxGroupProvider } from './checkboxGroup.context';
import { Size } from './Checkbox';

export type Value = string | number;

type CheckboxGroupProps<T extends Value> = {
    value?: T[];
    defaultValue?: T[];
    onChange?: (values: T[]) => void;
    name?: string;
    disabled?: boolean;
    size?: Size;
    children: React.ReactNode;
    ariaLabel?: string;
};

export function CheckboxGroup<T extends Value>({
    value,
    defaultValue = [],
    onChange,
    name,
    disabled,
    size,
    children,
    ariaLabel,
}: CheckboxGroupProps<T>) {
    const isControlled = value !== undefined;
    const [inner, setInner] = useState<T[]>(() => defaultValue);

    const finalAriaLabel = ariaLabel ?? name;

    useEffect(() => {
        if (!ariaLabel && !name) {
            console.warn('CheckboxGroup: provide ariaLabel or name for accessibility');
        }
    }, [ariaLabel, name]);

    const current = isControlled ? value! : inner;

    const toggle = useCallback(
        (val: T) => {
            if (isControlled) {
                const exists = current.includes(val);
                const next = exists ? current.filter((v) => v !== val) : [...current, val];

                onChange?.(next);
            } else {
                setInner((prev) => {
                    const exists = prev.includes(val);
                    const next = exists ? prev.filter((v) => v !== val) : [...prev, val];

                    onChange?.(next);
                    return next;
                });
            }
        },
        [isControlled, current, onChange],
    );

    const ctx = useMemo(
        () => ({
            value: current,
            toggle,
            name,
            disabled: !!disabled,
            size,
        }),
        [current, toggle, name, disabled, size],
    );

    return (
        <CheckboxGroupProvider value={ctx}>
            <div role="group" {...(finalAriaLabel && { 'aria-label': finalAriaLabel })}>
                {children}
            </div>
        </CheckboxGroupProvider>
    );
}
