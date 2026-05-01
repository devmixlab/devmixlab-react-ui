import React, { forwardRef, useEffect, useRef, useState } from 'react';
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
    value?: number | string;
    defaultValue?: number;

    min?: number;
    max?: number;
    step?: number;
};

const toNumber = (val: number | string | undefined) => {
    const n = typeof val === 'number' ? val : Number(val);
    return isNaN(n) ? 0 : n;
};

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            showStepper = false,
            unit,
            prefix,
            suffix,
            value,
            defaultValue,

            min = 0,
            max = 999,
            step = 1,

            id: idProp,
            ...props
        },
        ref,
    ) => {
        const [innerValue, setInnerValue] = useState(defaultValue ?? 0);
        const inputValueRef = useRef(toNumber(value ?? 0));

        const isControlled = value !== undefined;

        const clamp = (v: number) => {
            if (min !== undefined) v = Math.max(min, v);
            if (max !== undefined) v = Math.min(max, v);
            return v;
        };

        useEffect(() => {
            return () => clearTimeRefs();
        }, []);

        useEffect(() => {
            if (isControlled) {
                inputValueRef.current = toNumber(value);
            }
        }, [value]);

        const ctx = useFormFieldContext();
        const inputId = idProp ?? ctx?.id;

        const handleIncrDecr = (dir = true) => {
            const onChange = (prev: number) => {
                const next = clamp(dir ? prev + step : prev - step);

                inputValueRef.current = next;

                props.onValueChange?.(String(next));
                return next;
            };

            if (!isControlled) {
                setInnerValue((prev) => {
                    return onChange(prev);
                });
            } else {
                inputValueRef.current = onChange(inputValueRef.current);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                handleIncrDecr();
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleIncrDecr(false);
            }

            props.onKeyDown?.(e);
        };

        const intervalRef = useRef<number | null>(null);
        const timeoutRef = useRef<number | null>(null);

        const startPress = (run: () => void) => {
            run();
            clearTimeRefs();

            timeoutRef.current = setTimeout(() => {
                intervalRef.current = setInterval(() => {
                    run();
                }, 80);
            }, 300);
        };

        const clearTimeRefs = () => {
            if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
            if (intervalRef.current != null) clearInterval(intervalRef.current);
        };

        const displayValue = isControlled ? value : innerValue;
        const current = toNumber(displayValue);

        const isAtMin = current <= min;
        const isAtMax = current >= max;

        return (
            <Input
                {...props}
                inputMode="numeric"
                value={displayValue}
                onBlur={clearTimeRefs}
                id={inputId}
                ref={ref}
                type={'text'}
                start={prefix}
                onKeyDown={handleKeyDown}
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
                            <button
                                type="button"
                                disabled={isAtMax}
                                onMouseDown={() => startPress(() => handleIncrDecr())}
                                onMouseUp={clearTimeRefs}
                                onMouseLeave={clearTimeRefs}
                            >
                                <ChevronUp />
                            </button>
                            <button
                                type="button"
                                disabled={isAtMin}
                                onMouseDown={() => startPress(() => handleIncrDecr(false))}
                                onMouseUp={clearTimeRefs}
                                onMouseLeave={clearTimeRefs}
                            >
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
