import React, { forwardRef, useRef, useState } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box';
// import { Size } from '../form.tokens';
import { FieldRoot, SharedFieldRootProps } from '../FieldRoot';
import { mergeRefs } from '../../../utils/mergeRefs';
import { useFormFieldContext } from '../FormField/FormField.context';
import { Close, IconWrapper } from '../../../Icon';
import { classPrefix } from '../../../utils/classPrefix';
import { FieldLayoutProps, fieldRootPropKeys } from '../FieldRoot';
import { splitProps } from '../../../utils/splitProps';

type OwnTextInputProps = {
    htmlSize?: number;
    actions?: React.ReactNode;

    clearable?: boolean;
    clearIcon?: React.ReactNode;
    onClear?: () => void;
    onValueChange?: (value: string) => void;
};

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> &
    FieldLayoutProps &
    SharedFieldRootProps &
    OwnTextInputProps;

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password']);

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            className,
            invalid = false,

            actions,

            disabled,
            value,
            defaultValue,
            onChange,
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
        const [fieldRootProps, controlProps] = splitProps(rest, fieldRootPropKeys);

        const inputRef = useRef<HTMLInputElement>(null);

        const isControlled = value !== undefined;
        const isTextLike = TEXT_INPUT_TYPES.has(type);
        const finalClearIcon = clearIcon ? <IconWrapper>{clearIcon}</IconWrapper> : <Close />;

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;
        const inputProps = ctx
            ? {
                  ...controlProps,
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
              }
            : controlProps;

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

        const handleClearClick = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
            clearValue();
            inputRef.current?.focus();
        };

        const showClearable = clearable && isTextLike && hasValue && !disabled && !readOnly;

        const combinedRef = mergeRefs(inputRef, ref);

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
                className={clsx(classPrefix('--text-input'), className)}
                invalid={isInvalid}
                disabled={disabled}
                focusTargetRef={inputRef}
                actions={finalActions}
                data-clearable={clearable || undefined}
                {...fieldRootProps}
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
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={isInvalid || undefined}
                    {...inputProps}
                />
            </FieldRoot>
        );
    },
);

TextInput.displayName = 'TextInput';

export { TextInput };

export type { TextInputProps };
