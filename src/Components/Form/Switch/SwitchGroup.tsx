// SwitchGroup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { SwitchGroupProvider } from './switchGroup.context';

type SwitchGroupProps = {
    value?: Record<string, boolean>;
    defaultValue?: Record<string, boolean>;
    onChange?: (value: Record<string, boolean>) => void;
    disabled?: boolean;
    children: React.ReactNode;
};

export function SwitchGroup({
    value,
    defaultValue = {},
    onChange,
    disabled,
    children,
}: SwitchGroupProps) {
    const isControlled = value !== undefined;
    const [inner, setInner] = useState(defaultValue);

    const current = isControlled ? value! : inner;

    const toggle = useCallback(
        (name: string, next: boolean) => {
            const updated = { ...current, [name]: next };

            if (!isControlled) {
                setInner(updated);
            }

            onChange?.(updated);
        },
        [current, isControlled, onChange],
    );

    const ctx = useMemo(() => ({ value: current, toggle, disabled }), [current, toggle, disabled]);

    return <SwitchGroupProvider value={ctx}>{children}</SwitchGroupProvider>;
}
