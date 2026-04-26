import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from './input.tokens';
import { prefix } from './input.helpers';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/formField.context';
import { CloseIcon } from './CloseIcon';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    variant?: Variant;
    size?: Size;
    htmlSize?: number;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;

    clearable?: boolean;
    onClear?: () => void;
    onValueChange?: (value: string) => void;
};

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password']);

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant = 'outlined',
            size = 'md',
            invalid = false,
            rounded = 'md',
            startAdornment,
            endAdornment,
            disabled,
            value,
            defaultValue,
            onChange,
            onKeyDown,
            htmlSize,
            type = 'text',
            readOnly,

            clearable = false,
            onClear,
            onValueChange,

            ...rest
        },
        ref,
    ) => {
        const ctx = useFormFieldContext();
        const inputProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
                  'aria-invalid': ctx.hasError || invalid || undefined,
              }
            : {};

        const isControlled = value !== undefined;

        const isTextLike = TEXT_INPUT_TYPES.has(type);

        const inputRef = useRef<HTMLInputElement>(null);

        // minimal UI state (only for uncontrolled)
        const [hasValueState, setHasValueState] = useState(
            () => defaultValue != null && String(defaultValue).length > 0,
        );

        const hasValue = isControlled ? value != null && String(value).length > 0 : hasValueState;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) {
                setHasValueState(e.target.value.length > 0);
            }

            onChange?.(e);
            onValueChange?.(e.target.value);
        };

        const handleClear = () => {
            console.log('handleClear');
            if (isControlled) {
                onValueChange?.('');

                onChange?.({
                    target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>);
            } else if (inputRef.current) {
                inputRef.current.value = '';
                setHasValueState(false);
            }

            onClear?.();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const isClearShortcut = e.key === 'Backspace' && (e.ctrlKey || e.metaKey);

            if (isClearShortcut && clearable && isTextLike && hasValue && !disabled && !readOnly) {
                e.preventDefault();
                handleClear();
            }

            onKeyDown?.(e);
        };

        const cl = clsx(className, prefix(), prefix(`--${variant}`), prefix(`--size-${size}`), {
            [prefix(`--invalid`)]: invalid,
            [prefix(`--disabled`)]: disabled,
            [prefix(`--clearable`)]: clearable,
        });

        const combinedRef = mergeRefs(inputRef, ref);

        return (
            <Box
                className={cl}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                rounded={rounded}
            >
                {startAdornment != null && (
                    <span className={prefix(`__icon`)}>{startAdornment}</span>
                )}

                <Box
                    ref={combinedRef}
                    as="input"
                    type={type}
                    size={htmlSize}
                    className={prefix(`__field`)}
                    value={isControlled ? value : undefined}
                    defaultValue={!isControlled ? defaultValue : undefined}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={invalid || undefined}
                    {...rest}
                    {...inputProps}
                />

                {endAdornment != null && <span className={prefix(`__icon`)}>{endAdornment}</span>}

                {clearable && isTextLike && hasValue && !disabled && !readOnly && (
                    <span className={prefix(`__clear`)}>
                        <button
                            type="button"
                            aria-label="Clear input"
                            onClick={handleClear}
                            onMouseDown={(e) => e.preventDefault()}
                            className={prefix(`__clear-button`)}
                            tabIndex={-1} // prevent focus steal
                        >
                            <CloseIcon />
                        </button>
                    </span>
                )}
            </Box>
        );
    },
);

Input.displayName = 'Input';

export { Input };
