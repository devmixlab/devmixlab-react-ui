import React, { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps } from '../TextInput';
import { useFormFieldContext } from '../FormField/FormField.context';
import { Eye, EyeOff } from '../../Icon';
import { classPrefix } from '../../../utils/classPrefix';

type PasswordInputProps = Omit<TextInputProps, 'type'> & {
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
        className={classPrefix('--toggle-button')}
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
            <TextInput
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

export type { PasswordInputProps };
