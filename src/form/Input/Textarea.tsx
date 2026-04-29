import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from './input.tokens';
import { prefix } from './input.helpers';
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

const getCount = (node: React.ReactNode): number => {
    if (!node) return 0;

    const children = React.Children.toArray(node);

    return children.reduce<number>((acc, child) => {
        if (React.isValidElement(child)) {
            if (child.props?.children) {
                return acc + getCount(child.props.children);
            }
            return acc + 1;
        }
        return acc;
    }, 0);
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

        const cl = clsx(
            className,
            prefix(),
            prefix('--textarea-input'),
            prefix(`--${variant}`),
            prefix(`--size-${size}`),
            {
                [prefix(`--invalid`)]: invalid,
                [prefix(`--disabled`)]: disabled,
                [prefix(`--clearable`)]: clearable,
                [prefix(`--has-start-adornment`)]: startAdornment,
                [prefix(`--has-end-adornment`)]: endAdornment,
            },
        );

        const combinedRef = mergeRefs(textareaRef, ref);

        const startCount = getCount(startAdornment);
        const endCount = getCount(endAdornment) + (clearable ? 1 : 0);

        return (
            <Box
                className={cl}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                rounded={rounded}
                style={
                    {
                        '--start-slot-count': startCount,
                        '--end-slot-count': endCount,
                    } as React.CSSProperties
                }
            >
                {startAdornment != null && (
                    <div className={clsx(prefix(`__slot`), prefix(`__slot-start`))}>
                        <span className={prefix(`__icon`)}>{startAdornment}</span>
                    </div>
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

                <div className={clsx(prefix(`__slot`), prefix(`__slot-end`))}>
                    {endAdornment != null && (
                        <span className={prefix(`__icon`)}>{endAdornment}</span>
                    )}

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
                </div>
            </Box>
        );
    },
);

Textarea.displayName = 'Textarea';

export { Textarea };
