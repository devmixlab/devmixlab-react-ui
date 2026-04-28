import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from './textarea.tokens';
import { prefix } from './textarea.helpers';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/formField.context';
import { Close } from '../../Icon/Close';

export type TextareaProps = Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'wrap'
> & {
    variant?: Variant;
    size?: Size;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];

    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;

    clearable?: boolean;
    onClear?: () => void;
    onValueChange?: (value: string) => void;

    rows?: number;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            readOnly,

            clearable = false,
            onClear,
            onValueChange,

            rows = 3,

            ...rest
        },
        ref,
    ) => {
        const ctx = useFormFieldContext();

        const textareaProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
                  'aria-invalid': ctx.hasError || invalid || undefined,
              }
            : {};

        const isControlled = value !== undefined;

        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const [hasValueState, setHasValueState] = useState(
            () => defaultValue != null && String(defaultValue).length > 0,
        );

        const hasValue = isControlled ? value != null && String(value).length > 0 : hasValueState;

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (!isControlled) {
                setHasValueState(e.target.value.length > 0);
            }

            onChange?.(e);
            onValueChange?.(e.target.value);
        };

        const handleClear = () => {
            if (isControlled) {
                onValueChange?.('');
                onChange?.({
                    target: { value: '' },
                } as React.ChangeEvent<HTMLTextAreaElement>);
            } else if (textareaRef.current) {
                textareaRef.current.value = '';
                setHasValueState(false);
            }

            onClear?.();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            const isClearShortcut = e.key === 'Backspace' && (e.ctrlKey || e.metaKey);

            if (isClearShortcut && clearable && hasValue && !disabled && !readOnly) {
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

        const combinedRef = mergeRefs(textareaRef, ref);

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
                    as="textarea"
                    rows={rows}
                    className={prefix(`__field`)}
                    value={isControlled ? value : undefined}
                    defaultValue={!isControlled ? defaultValue : undefined}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={invalid || undefined}
                    {...rest}
                    {...textareaProps}
                />

                {endAdornment != null && <span className={prefix(`__icon`)}>{endAdornment}</span>}

                {clearable && hasValue && !disabled && !readOnly && (
                    <span className={prefix(`__clear`)}>
                        <button
                            type="button"
                            aria-label="Clear textarea"
                            onClick={handleClear}
                            onMouseDown={(e) => e.preventDefault()}
                            className={prefix(`__clear-button`)}
                            tabIndex={-1}
                        >
                            <Close />
                        </button>
                    </span>
                )}
            </Box>
        );
    },
);

Textarea.displayName = 'Textarea';

export { Textarea };
