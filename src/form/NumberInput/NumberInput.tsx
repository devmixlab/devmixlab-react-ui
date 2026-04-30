import React, { forwardRef, useState } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { prefix as inputPrefix, renderGroupItem } from '../Input/input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { ChevronUp } from '../../Icon/ChevronUp';
import { ChevronDown } from '../../Icon/ChevronDown';

export type NumberInputProps = Omit<InputProps, 'type'> & {
    unit?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showStepper?: boolean;
};

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    ({ showStepper = false, unit, prefix, suffix, value, id: idProp, ...props }, ref) => {
        const [innerValue, setInnerValue] = useState(null);

        const isControlled = value == null;

        const ctx = useFormFieldContext();

        const inputId = idProp ?? ctx?.id;

        const step = props.step ?? 1;

        const handleIncrement = () => {
            const next = Number(value || 0) + step;
            props.onValueChange?.(String(next));
        };

        const handleDecrement = () => {
            const next = Number(value || 0) - step;
            props.onValueChange?.(String(next));
        };

        return (
            <Input
                {...props}
                inputMode="numeric"
                id={inputId}
                ref={ref}
                type={'text'}
                start={prefix}
                end={
                    <>
                        {renderGroupItem(suffix)}
                        {renderGroupItem(unit)}
                    </>
                }
                controls={
                    showStepper &&
                    renderGroupItem(
                        <div className={inputPrefix('__stepper')}>
                            <button>
                                <ChevronUp />
                            </button>
                            <button>
                                <ChevronDown />
                            </button>
                        </div>,
                    )
                }
            />
        );
    },
);

NumberInput.displayName = 'NumberInput';

export { NumberInput };
