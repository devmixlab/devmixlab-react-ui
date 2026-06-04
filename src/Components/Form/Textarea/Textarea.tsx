import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size } from '../form.tokens';
import { Variant } from '../FieldRoot/FieldRoot';
import { mergeRefs } from '../../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/FormField.context';
import { IconWrapper, Close } from '../../../Icon';
import { FieldRoot, ShareFieldRootProps } from '../FieldRoot';
import { classPrefix } from '../../../utils/classPrefix';
import { FieldLayoutProps, fieldRootPropKeys } from '../FieldRoot';
import { splitProps } from '../../../utils/splitProps';
import { defineUniqueTuple } from '../../../types/tuple';

type OwnTextareaProps = {
    // actions?: React.ReactNode; // 👈 NEW

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClear?: () => void;
    onValueChange?: (value: string) => void;

    rows?: number;
};

export type TextareaProps = Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'size' | 'wrap'
> &
    FieldLayoutProps &
    ShareFieldRootProps &
    OwnTextareaProps;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            invalid = false,

            actions,

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
        // props,
        ref,
    ) => {
        const [fieldRootProps, controlProps] = splitProps(rest, fieldRootPropKeys);

        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const isControlled = value !== undefined;
        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;
        const textareaProps = ctx
            ? {
                  ...controlProps,
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
              }
            : controlProps;

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
                focusTargetRef={textareaRef}
                actions={finalActions}
                {...fieldRootProps}
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
                    {...textareaProps}
                />
            </FieldRoot>
        );
    },
);

Textarea.displayName = 'Textarea';

export { Textarea };
