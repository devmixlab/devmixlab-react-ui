import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size } from '../form.tokens';
import { Variant } from '../FieldRoot/FieldRoot';
import { mergeRefs } from '../../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/formField.context';
import { IconWrapper, Close } from '../../../Icon';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { classPrefix } from '../../../utils/classPrefix';

export type TextareaProps = Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'wrap'
> & {
    variant?: Variant;
    size?: Size;
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

            start,
            end,
            actions,
            controls,

            disabled,
            value,
            defaultValue,
            onChange,
            readOnly,

            clearable = false,
            clearIcon,
            onClear,
            onValueChange,

            rows = 3,

            ...rest
        },
        ref,
    ) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const isControlled = value !== undefined;
        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;
        const textareaProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
              }
            : {};

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

        const clearValue = () => {
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

        const handleClearClick = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            clearValue();
        };

        const showClearable = clearable && hasValue && !disabled && !readOnly;

        const cl = clsx(className, classPrefix('--textarea'), {
            [classPrefix(`--clearable`)]: clearable,
        });

        const combinedRef = mergeRefs(textareaRef, ref);

        const clearButton = (
            <button
                type="button"
                aria-label="Clear input"
                onClick={handleClearClick}
                onMouseDown={(e) => e.preventDefault()}
                className={classPrefix(`--clear-button`)}
            >
                {finalClearIcon}
            </button>
        );

        const hasActions = Boolean(actions || showClearable);

        const finalActions = hasActions ? (
            <>
                {actions}
                {showClearable && clearButton}
            </>
        ) : undefined;

        return (
            <FieldRoot
                className={cl}
                invalid={isInvalid}
                disabled={disabled}
                rounded={rounded}
                focusTargetRef={textareaRef}
                start={start}
                end={end}
                actions={finalActions}
                controls={controls}
                variant={variant}
                size={size}
            >
                <Box
                    ref={combinedRef}
                    as="textarea"
                    rows={rows}
                    className={classPrefix(`--field`)}
                    value={isControlled ? value : undefined}
                    defaultValue={!isControlled ? defaultValue : undefined}
                    onChange={handleChange}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={isInvalid || undefined}
                    {...rest}
                    {...textareaProps}
                />
            </FieldRoot>
        );
    },
);

Textarea.displayName = 'Textarea';

export { Textarea };
