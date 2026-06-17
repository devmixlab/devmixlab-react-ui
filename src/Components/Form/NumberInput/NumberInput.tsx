import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { TextInput, type TextInputProps } from '../TextInput';
import { renderGroupItem } from '../FieldRoot';
import { classPrefix } from '../../../utils/classPrefix';
import { useFormFieldContext } from '../FormField/FormField.context';
import { ChevronUp, ChevronDown } from '../../Icon';
import Decimal from 'decimal.js';
import clsx from 'clsx';
import {
    isAtBound,
    toDecimal,
    snapToStep,
    toNumber,
    formatWithSeparator,
    formatDisplay,
    sanitizeInput,
    countDigits,
    findCursorFromDigits,
} from './NumberInput.helpers';

type NumberInputProps = Omit<TextInputProps, 'type' | 'prefix' | 'suffix'> & {
    unit?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showStepper?: boolean;
    value?: number | string;
    defaultValue?: number;
    integerOnly?: boolean;
    fixedDecimals?: number;
    thousandSeparator?: boolean;
    stepAcceleration?: boolean;
    stickToStep?: boolean;

    min?: number;
    max?: number;
    step?: number;
};

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    (
        {
            className,

            showStepper = false,
            unit,
            prefix,
            suffix,
            value,
            defaultValue,
            integerOnly = false,
            fixedDecimals,
            thousandSeparator,
            stepAcceleration,

            onChange,

            min,
            max,
            step = 1,

            id: idProp,
            ...props
        },
        ref,
    ) => {
        const [innerValue, setInnerValue] = useState<string>(
            defaultValue != null ? String(defaultValue) : '',
        );

        const inputValueRef = useRef<Decimal>(new Decimal(toNumber(value ?? 0) ?? 0));
        const prevValueRef = useRef('');
        const pressCountRef = useRef(0);

        const isControlled = value !== undefined;

        const clampDecimal = (v: Decimal) => {
            if (min !== undefined) v = Decimal.max(v, min);
            if (max !== undefined) v = Decimal.min(v, max);
            return v;
        };

        useEffect(() => {
            return () => clearTimeRefs();
        }, []);

        useEffect(() => {
            const stop = () => clearTimeRefs();

            window.addEventListener('mouseup', stop);

            return () => {
                window.removeEventListener('mouseup', stop);
            };
        }, []);

        useEffect(() => {
            if (isControlled) {
                const n = toNumber(value);
                // if (n !== null) inputValueRef.current = n;
                if (n !== null) inputValueRef.current = new Decimal(n);
            }
        }, [value]);

        const ctx = useFormFieldContext();
        const inputId = idProp ?? ctx?.id;

        const handleIncrDecr = (dir = true, multiplier = 1) => {
            const current = inputValueRef.current;

            const delta = new Decimal(step).times(multiplier);

            const nextDecimal = dir ? current.plus(delta) : current.minus(delta);

            const clamped = clampDecimal(nextDecimal);

            inputValueRef.current = clamped;

            const str = formatDisplay(clamped, fixedDecimals, thousandSeparator);

            if (!isControlled) {
                setInnerValue(str);
            }

            props.onValueChange?.(str);
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

        const startPress = (run: (multiplier: number) => void) => {
            pressCountRef.current = 0;

            const getMultiplier = (count: number) => {
                if (!stepAcceleration) return 1;

                if (count > 20) return 10;
                if (count > 10) return 5;
                if (count > 5) return 2;
                return 1;
            };

            const tick = () => {
                pressCountRef.current += 1;

                const multiplier = getMultiplier(pressCountRef.current);

                run(multiplier);
            };

            tick();
            clearTimeRefs();

            timeoutRef.current = setTimeout(() => {
                intervalRef.current = setInterval(tick, 80);
            }, 300);
        };

        const clearTimeRefs = () => {
            if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
            if (intervalRef.current != null) clearInterval(intervalRef.current);
        };

        const displayValue = isControlled ? value : innerValue;

        const isAtMin = isAtBound(inputValueRef.current, min, 'lte');
        const isAtMax = isAtBound(inputValueRef.current, max, 'gte');

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
            const input = e.currentTarget instanceof HTMLInputElement ? e.currentTarget : null;

            if (!input) {
                const raw = (e.target as any)?.value ?? '';

                const clean = sanitizeInput(raw);
                const normalizedValue = normalizeValue(clean);

                const dec = toDecimal(normalizedValue);

                if (dec !== null) {
                    inputValueRef.current = dec;
                }

                if (!isControlled) {
                    setInnerValue(normalizedValue);
                }

                props.onValueChange?.(normalizedValue);
                onChange?.(e);

                return; // stop here (no cursor logic)
            }

            const prev = prevValueRef.current;
            const raw = input.value;
            const cursor = input.selectionStart ?? raw.length;

            const native = e.nativeEvent as InputEvent | undefined;

            const inputType = native && 'inputType' in native ? native.inputType : undefined;

            const isDeleteForward = inputType === 'deleteContentForward';

            let digitsBeforeCursor = countDigits(raw.slice(0, cursor));

            if (isDeleteForward && prev[cursor] === ',') {
                // skip comma → move forward by one digit
                digitsBeforeCursor += 1;
            }

            const clean = sanitizeInput(raw);
            const normalizedValue = normalizeValue(clean);

            const dec = toDecimal(normalizedValue);

            if (dec !== null) {
                inputValueRef.current = dec;
            }

            const formatted = dec
                ? formatDisplay(dec, fixedDecimals, thousandSeparator)
                : normalizedValue;

            input.value = formatted;

            if (!isControlled) {
                setInnerValue(formatted);
            }

            props.onValueChange?.(formatted);
            onChange?.(e);

            // store AFTER formatting
            prevValueRef.current = formatted;

            requestAnimationFrame(() => {
                let nextCursor = findCursorFromDigits(formatted, digitsBeforeCursor);

                if (isDeleteForward && prev[cursor] === ',') {
                    nextCursor -= 1;
                }

                // clamp
                nextCursor = Math.max(0, Math.min(nextCursor, formatted.length));

                input.setSelectionRange(nextCursor, nextCursor);
            });
        };

        // const handleClear = () => {
        //     console.log(1111);
        // };

        const onInputBlur = () => {
            clearTimeRefs();

            // handle empty explicitly
            if (displayValue === '') {
                // inputValueRef.current = min ?? 0;
                inputValueRef.current = new Decimal(min ?? 0);

                if (!isControlled) {
                    setInnerValue('');
                }

                props.onValueChange?.('');
                return;
            }

            // ✅ FIX: sanitize before parsing
            const clean = sanitizeInput(String(displayValue));
            const dec = toDecimal(clean);

            if (!dec) {
                inputValueRef.current = new Decimal(min ?? 0);

                if (!isControlled) {
                    setInnerValue('');
                }

                props.onValueChange?.('');
                return;
            }

            let next = dec;

            // snap to step (only here)
            if (props.stickToStep && step) {
                next = snapToStep(next, step);
            }

            // clamp AFTER snapping
            const clamped = clampDecimal(next);

            inputValueRef.current = clamped;

            const str = formatDisplay(clamped, fixedDecimals, thousandSeparator);

            if (!isControlled) {
                setInnerValue(str);
            }

            props.onValueChange?.(str);
        };

        return (
            <TextInput
                {...props}
                className={clsx(className, classPrefix('--number-input'))}
                inputMode={integerOnly ? 'numeric' : 'decimal'}
                value={displayValue}
                onBlur={onInputBlur}
                id={inputId}
                ref={ref}
                type={'text'}
                start={prefix}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                // onClear={handleClear}
                end={
                    suffix || unit ? (
                        <>
                            {suffix && renderGroupItem(suffix)}
                            {unit && renderGroupItem(unit)}
                        </>
                    ) : undefined
                }
                controls={
                    showStepper &&
                    renderGroupItem(
                        <div className={classPrefix('--stepper')}>
                            <button
                                type="button"
                                disabled={isAtMax}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    startPress((m) => handleIncrDecr(true, m));
                                }}
                                onMouseUp={clearTimeRefs}
                                onMouseLeave={clearTimeRefs}
                            >
                                <ChevronUp />
                            </button>
                            <button
                                type="button"
                                disabled={isAtMin}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    startPress((m) => handleIncrDecr(false, m));
                                }}
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

export type { NumberInputProps };
