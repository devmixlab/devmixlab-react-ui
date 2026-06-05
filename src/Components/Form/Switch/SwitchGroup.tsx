// SwitchGroup.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { SwitchGroupProvider } from './SwitchGroup.context';

//-----------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------
type SwitchGroupValue = Record<string, boolean>;

type SwitchGroupProps = {
    value?: SwitchGroupValue;
    defaultValue?: SwitchGroupValue;
    onChange?: (value: SwitchGroupValue) => void;
    disabled?: boolean;
    children: React.ReactNode;
};

//-----------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------
function SwitchGroup({ value, defaultValue = {}, onChange, disabled, children }: SwitchGroupProps) {
    const isControlled = value !== undefined;
    const [inner, setInner] = useState<SwitchGroupValue>(defaultValue);

    // const current = isControlled ? value! : inner;
    const current = value ?? inner;

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

export { SwitchGroup };

export type { SwitchGroupProps, SwitchGroupValue };
