import React, { forwardRef, useState } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { prefix } from '../Input/input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { TriangleDown } from '../../Icon/TriangleDown';
// import { EyeOff } from '../../Icon/EyeOff';

export type NumberInputProps = Omit<InputProps, 'type'> & {
    unit?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showStepper?: boolean;
};

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    ({ showStepper = false, unit, prefix, suffix, id: idProp, ...props }, ref) => {
        // const [visible, setVisible] = useState(false);
        const ctx = useFormFieldContext();

        const inputId = idProp ?? ctx?.id;

        return (
            <Input
                {...props}
                id={inputId}
                ref={ref}
                type={'text'}
                startAdornment={prefix}
                endAdornment={
                    <>
                        {suffix}
                        {unit}
                        {showStepper && (
                            <div>
                                <button>fff</button>
                            </div>
                        )}
                    </>
                }
            />
        );
    },
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
