import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box/Box';
import { Size } from './form.tokens';
import { mergeRefs } from '../utils/mergeRefs';
import { useFormFieldContext } from './FormField/formField.context';
import { Close } from '../Icon/Close';
import { IconWrapper } from '../Icon/IconWrapper';
import { FieldRoot } from './FieldRoot';
import { classPrefix } from '../utils/classPrefix';

export type Variant = 'outlined' | 'filled' | 'ghost';

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    variant?: Variant;
    size?: Size;
    htmlSize?: number;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode; // 👈 NEW
    controls?: React.ReactNode; // 👈 optional (for NumberInput later)

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClear?: () => void;
    onValueChange?: (value: string) => void;
};

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password']);

const TextInput = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant = 'outlined',
            size = 'md',
            invalid = false,
            rounded = 'md',

            start,
            end,
            actions,
            controls,

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
        const inputRef = useRef<HTMLInputElement>(null);

        const isControlled = value !== undefined;
        const isTextLike = TEXT_INPUT_TYPES.has(type);
        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const ctx = useFormFieldContext();
        const inputProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
                  'aria-invalid': ctx.hasError || invalid || undefined,
              }
            : { 'aria-invalid': invalid || undefined };

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

        const cl = clsx(className, classPrefix('--text-input'), {
            [classPrefix(`--clearable`)]: clearable,
        });

        const combinedRef = mergeRefs(inputRef, ref);

        const clearButton = (
            <button
                type="button"
                aria-label="Clear input"
                onClick={handleClearClick}
                onMouseDown={(e) => e.preventDefault()}
                className={classPrefix(`--clear-button`)}
                tabIndex={0}
            >
                {finalClearIcon}
            </button>
        );

        const hasActions = actions || showClearable;

        const finalActions = hasActions ? (
            <>
                {actions}
                {showClearable && clearButton}
            </>
        ) : undefined;

        return (
            <FieldRoot
                className={cl}
                invalid={invalid}
                disabled={disabled}
                rounded={rounded}
                focusTargetRef={inputRef}
                start={start}
                end={end}
                actions={finalActions}
                controls={controls}
                variant={variant}
                size={size}
                data-disabled={disabled || undefined}
                data-size={size}
                data-clearable={clearable || undefined}
            >
                <Box
                    ref={combinedRef}
                    as="input"
                    type={type}
                    size={htmlSize}
                    className={classPrefix(`--field`)}
                    value={isControlled ? value : undefined}
                    defaultValue={!isControlled ? defaultValue : undefined}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-disabled={disabled || undefined}
                    {...rest}
                    {...inputProps}
                />
            </FieldRoot>
        );
    },
);

TextInput.displayName = 'TextInput';

export { TextInput };
