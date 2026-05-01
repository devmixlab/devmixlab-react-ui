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
    integerOnly?: boolean;

    min?: number;
    max?: number;
    step?: number;
};

const toNumber = (val: number | string | undefined) => {
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) ? n : null;
};

const isNumber = (n: number | null): n is number => n !== null;

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            showStepper = false,
            unit,
            prefix,
            suffix,
            value,
            defaultValue,
            integerOnly = false,

            onChange,

            min = 0,
            max = 999,
            step = 1,

            id: idProp,
            ...props
        },
        ref,
    ) => {
        const [innerValue, setInnerValue] = useState<string>(
            defaultValue != null ? String(defaultValue) : '',
        );
        const inputValueRef = useRef<number>(toNumber(value ?? 0) ?? 0);

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
                const n = toNumber(value);
                if (n !== null) inputValueRef.current = n;
            }
        }, [value]);

        const ctx = useFormFieldContext();
        const inputId = idProp ?? ctx?.id;

        const handleIncrDecr = (dir = true) => {
            const next = clamp(dir ? inputValueRef.current + step : inputValueRef.current - step);

            inputValueRef.current = next;

            if (!isControlled) {
                setInnerValue(String(next));
            }

            props.onValueChange?.(String(next));
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
        const current = toNumber(displayValue) ?? 0;

        const isAtMin = current <= min;
        const isAtMax = current >= max;

        const normalizeValue = (val: string) => {
            if (!val) return '';

            // 1. normalize comma → dot
            let normalized = val.replace(',', '.');

            // 2. remove all invalid chars (keep digits, dot, minus)
            normalized = normalized.replace(/[^\d.-]/g, '');

            // 3. allow only ONE minus at the start
            normalized = normalized
                .replace(/(?!^)-/g, '') // remove all '-' not at start
                .replace(/^(-)+/, '-'); // collapse multiple '-' to one

            // 4. allow only ONE dot
            const parts = normalized.split('.');
            if (parts.length > 2) {
                normalized = parts[0] + '.' + parts.slice(1).join('');
            }

            // 5. integer mode → remove decimals
            if (integerOnly && normalized.includes('.')) {
                normalized = normalized.split('.')[0];
            }

            return normalized;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target;
            const raw = input.value;
            const cursor = input.selectionStart ?? raw.length;

            const normalizedValue = normalizeValue(raw);

            // force DOM sync immediately
            input.value = normalizedValue;

            const num = toNumber(normalizedValue);
            if (num !== null) {
                inputValueRef.current = num;
            }

            if (!isControlled) {
                setInnerValue(normalizedValue);
            }

            props.onValueChange?.(normalizedValue);
            onChange?.(e);

            requestAnimationFrame(() => {
                const before = raw.slice(0, cursor);
                const normalizedBefore = normalizeValue(before);
                const removedBeforeCursor = before.length - normalizedBefore.length;

                const nextCursor = cursor - removedBeforeCursor;
                const safeCursor = Math.max(0, Math.min(nextCursor, normalizedValue.length));
                input.setSelectionRange(safeCursor, safeCursor);
            });
        };

        const onInputBlur = () => {
            clearTimeRefs();

            // handle empty explicitly
            if (displayValue === '') {
                inputValueRef.current = min ?? 0;

                if (!isControlled) {
                    setInnerValue('');
                }

                props.onValueChange?.('');
                return;
            }

            const num = Number(displayValue);

            if (!Number.isFinite(num)) {
                inputValueRef.current = min ?? 0;

                if (!isControlled) {
                    setInnerValue('');
                }

                props.onValueChange?.('');
                return;
            }

            const normalizedValue = clamp(num);

            inputValueRef.current = normalizedValue;

            if (!isControlled) {
                setInnerValue(String(normalizedValue));
            }

            props.onValueChange?.(String(normalizedValue));
        };

        return (
            <Input
                {...props}
                inputMode={integerOnly ? 'numeric' : 'decimal'}
                value={displayValue}
                onBlur={onInputBlur}
                id={inputId}
                ref={ref}
                type={'text'}
                start={prefix}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
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
