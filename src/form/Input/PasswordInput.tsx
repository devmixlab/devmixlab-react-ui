import React, { forwardRef, useState } from 'react';
import { Input, type InputProps } from './Input';
import { prefix } from './input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { Eye } from '../../Icon/Eye';
import { EyeOff } from '../../Icon/EyeOff';

export type PasswordInputProps = Omit<InputProps, 'type'> & {
    showToggle?: boolean;
};

type ToggleButtonProps = {
    toggle: () => void;
    visible: boolean;
    id?: string;
};

const ToggleButton = ({ toggle, visible, id }: ToggleButtonProps) => (
    <button
        type="button"
        onClick={toggle}
        onMouseDown={(e) => e.preventDefault()}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        aria-controls={id ?? undefined}
        // tabIndex={-1} // prevent stealing focus
        className={prefix('__toggle')}
    >
        <span aria-hidden="true">{visible ? <EyeOff /> : <Eye />}</span>
    </button>
);

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ showToggle = false, actions, id: idProp, ...props }, ref) => {
        const [visible, setVisible] = useState(false);
        const ctx = useFormFieldContext();

        const inputId = idProp ?? ctx?.id;

        const toggle = () => setVisible((v) => !v);

        return (
            <Input
                {...props}
                id={inputId}
                ref={ref}
                type={visible ? 'text' : 'password'}
                actions={
                    showToggle ? (
                        <>
                            {actions}
                            <ToggleButton toggle={toggle} visible={visible} id={inputId} />
                        </>
                    ) : (
                        actions
                    )
                }
            />
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
