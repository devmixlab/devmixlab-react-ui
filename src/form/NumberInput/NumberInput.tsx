import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { prefix as inputPrefix, renderGroupItem } from '../Input/input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { ChevronUp } from '../../Icon/ChevronUp';
import { ChevronDown } from '../../Icon/ChevronDown';
import Decimal from 'decimal.js';

const isAtBound = (value: Decimal, bound: number | undefined, cmp: 'lte' | 'gte') => {
    if (bound === undefined) return false;
    return value[cmp](bound);
};

const toDecimal = (val: number | string | undefined) => {
    if (val === '' || val === '-' || val === '.' || val === '-.') {
        return null;
    }

    try {
        return new Decimal(val ?? 0);
    } catch {
        return null;
    }
};

export type NumberInputProps = Omit<InputProps, 'type'> & {
    unit?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    showStepper?: boolean;
    value?: number | string;
    defaultValue?: number;
    integerOnly?: boolean;
    fixedDecimals?: number;
    thousandSeparator?: boolean;

    min?: number;
    max?: number;
    step?: number;
};

const formatDecimal = (d: Decimal, fixed?: number) => {
    if (fixed != null) {
        return d.toFixed(fixed);
    }

    return d.toString();
};

const toNumber = (val: number | string | undefined) => {
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) ? n : null;
};

const formatWithSeparator = (val: string) => {
    if (!val) return val;

    const [int, dec] = val.split('.');

    const formattedInt = int
        .replace('-', '') // handle negative separately
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const sign = int.startsWith('-') ? '-' : '';

    return dec != null ? `${sign}${formattedInt}.${dec}` : `${sign}${formattedInt}`;
};

const formatDisplay = (d: Decimal, fixed?: number, thousandSeparator?: boolean) => {
    let str = fixed != null ? d.toFixed(fixed) : d.toString();

    if (thousandSeparator) {
        str = formatWithSeparator(str);
    }

    return str;
};

const sanitizeInput = (val: string) => {
    if (!val) return val;

    return (
        val
            // remove group separators (IMPORTANT: add comma)
            .replace(/[,\s_]/g, '') // ✅ comma added
            // remove currency symbols
            .replace(/[$€£¥]/g, '')
    );
};

const countDigits = (str: string) => {
    return str.replace(/\D/g, '').length;
};

const findCursorFromDigits = (formatted: string, digitIndex: number) => {
    let count = 0;

    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
            count++;
        }

        if (count >= digitIndex) {
            return i + 1;
        }
    }

    return formatted.length;
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
            integerOnly = false,
            fixedDecimals,
            thousandSeparator,

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
        // const inputValueRef = useRef<number>(toNumber(value ?? 0) ?? 0);
        const inputValueRef = useRef<Decimal>(new Decimal(toNumber(value ?? 0) ?? 0));

        const isControlled = value !== undefined;

        const clamp = (v: number) => {
            if (min !== undefined) v = Math.max(min, v);
            if (max !== undefined) v = Math.min(max, v);
            return v;
        };

        const clampDecimal = (v: Decimal) => {
            if (min !== undefined) v = Decimal.max(v, min);
            if (max !== undefined) v = Decimal.min(v, max);
            return v;
        };

        useEffect(() => {
            return () => clearTimeRefs();
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

        // const handleIncrDecr = (dir = true) => {
        //     const next = clamp(dir ? inputValueRef.current + step : inputValueRef.current - step);
        //
        //     inputValueRef.current = next;
        //
        //     if (!isControlled) {
        //         setInnerValue(String(next));
        //     }
        //
        //     props.onValueChange?.(String(next));
        // };

        const handleIncrDecr = (dir = true) => {
            const current = inputValueRef.current;

            const nextDecimal = dir ? current.plus(step) : current.minus(step);

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
        // const current = inputValueRef.current.toNumber();
        //
        // const isAtMin = current <= min;
        // const isAtMax = current >= max;

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

        // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        //     const input = e.target;
        //     const raw = input.value;
        //     const clean = sanitizeInput(raw);
        //     const cursor = input.selectionStart ?? raw.length;
        //
        //     // const normalizedValue = normalizeValue(raw);
        //     const normalizedValue = normalizeValue(clean);
        //
        //     // force DOM sync immediately
        //     input.value = normalizedValue;
        //
        //     // const num = toNumber(normalizedValue);
        //     // if (num !== null) {
        //     //     inputValueRef.current = num;
        //     // }
        //     const dec = toDecimal(normalizedValue);
        //     if (dec !== null) {
        //         inputValueRef.current = dec;
        //     }
        //
        //     if (!isControlled) {
        //         setInnerValue(normalizedValue);
        //     }
        //
        //     props.onValueChange?.(normalizedValue);
        //     onChange?.(e);
        //
        //     requestAnimationFrame(() => {
        //         const before = raw.slice(0, cursor);
        //
        //         const beforeClean = sanitizeInput(before); // ✅ add this
        //         const normalizedBefore = normalizeValue(beforeClean); // ✅ fix
        //
        //         const removedBeforeCursor = before.length - normalizedBefore.length;
        //
        //         const nextCursor = cursor - removedBeforeCursor;
        //         const safeCursor = Math.max(0, Math.min(nextCursor, normalizedValue.length));
        //         input.setSelectionRange(safeCursor, safeCursor);
        //     });
        // };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target;
            const raw = input.value;
            const cursor = input.selectionStart ?? raw.length;

            // 1. how many digits before cursor
            const digitsBeforeCursor = countDigits(raw.slice(0, cursor));

            // 2. sanitize + normalize
            const clean = sanitizeInput(raw);
            const normalizedValue = normalizeValue(clean);

            // 3. decimal
            const dec = toDecimal(normalizedValue);

            if (dec !== null) {
                inputValueRef.current = dec;
            }

            // 4. format ALWAYS
            const formatted = dec
                ? formatDisplay(dec, fixedDecimals, thousandSeparator)
                : normalizedValue;

            input.value = formatted;

            // 5. update UI
            if (!isControlled) {
                setInnerValue(formatted);
            }

            props.onValueChange?.(formatted);
            onChange?.(e);

            // 6. restore cursor based on digits
            requestAnimationFrame(() => {
                const nextCursor = findCursorFromDigits(formatted, digitsBeforeCursor);
                input.setSelectionRange(nextCursor, nextCursor);
            });
        };

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
            // const num = Number(displayValue);
            // const dec = toDecimal(displayValue);

            // if (!Number.isFinite(num)) {
            if (!dec) {
                // inputValueRef.current = min ?? 0;
                inputValueRef.current = new Decimal(min ?? 0);

                if (!isControlled) {
                    setInnerValue('');
                }

                props.onValueChange?.('');
                return;
            }

            // const normalizedValue = clamp(num);
            // const normalizedValue = clamp(dec.toNumber());
            const clamped = clampDecimal(dec);

            // inputValueRef.current = normalizedValue;
            // inputValueRef.current = new Decimal(normalizedValue);
            inputValueRef.current = clamped;
            const str = formatDisplay(clamped, fixedDecimals, thousandSeparator);

            if (!isControlled) {
                setInnerValue(str);
            }

            props.onValueChange?.(str);
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
