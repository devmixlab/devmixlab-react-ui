import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from './input.tokens';
import { prefix } from './input.helpers';
import { mergeRefs } from '../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/formField.context';
import { Close } from '../../Icon/Close';
import { IconWrapper } from '../../Icon/IconWrapper';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    variant?: Variant;
    size?: Size;
    htmlSize?: number;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClear?: () => void;
    onValueChange?: (value: string) => void;
};

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password']);

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
            clearIcon,
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

        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

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

        const handleClearClick = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            clearValue();
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const isClearShortcut = e.key === 'Backspace' && (e.ctrlKey || e.metaKey);

            if (isClearShortcut && clearable && isTextLike && hasValue && !disabled && !readOnly) {
                e.preventDefault();
                clearValue(); // no event needed
            }

            onKeyDown?.(e);
        };

        const clearValue = () => {
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

        const showClearable = clearable && isTextLike && hasValue && !disabled && !readOnly;

        const cl = clsx(
            className,
            prefix(),
            prefix('--field-input'),
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

        const combinedRef = mergeRefs(inputRef, ref);

        const startCount = getCount(startAdornment);
        const endCount = getCount(endAdornment) + (clearable ? 1 : 0);

        // const startCount = startAdornment ? React.Children.count(startAdornment) : 0;
        //
        // const endCount =
        //     (endAdornment ? React.Children.count(endAdornment) : 0) + (clearable ? 1 : 0);

        return (
            <Box
                className={cl}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                rounded={rounded}
                onClick={() => {
                    if (disabled) return;
                    inputRef.current?.focus();
                }}
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
                    aria-disabled={disabled || undefined}
                    {...rest}
                    {...inputProps}
                />

                {(endAdornment != null || showClearable) && (
                    <div className={clsx(prefix(`__slot`), prefix(`__slot-end`))}>
                        {endAdornment != null && (
                            <span className={prefix(`__icon`)}>{endAdornment}</span>
                        )}

                        {showClearable && (
                            <span className={prefix(`__clear`)}>
                                <button
                                    type="button"
                                    aria-label="Clear input"
                                    onClick={handleClearClick}
                                    onMouseDown={(e) => e.preventDefault()}
                                    className={prefix(`__clear-button`)}
                                    tabIndex={-1} // prevent focus steal
                                >
                                    {finalClearIcon}
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </Box>
        );
    },
);

Input.displayName = 'Input';

export { Input };
