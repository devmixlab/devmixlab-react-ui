import React, { forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from '../Input/input.tokens';
import { prefix } from '../Input/input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { TriangleDown as TriangleDownIcon } from '../../Icon';
import { mergeRefs } from '../../utils/mergeRefs';
import { FieldRoot } from '../FieldRoot/FieldRoot';

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
    variant?: Variant;
    size?: Size;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode; // 👈 NEW
    controls?: React.ReactNode; // 👈 optional (for NumberInput later)
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            children,

            variant = 'outlined',
            size = 'md',
            invalid = false,
            disabled = false,
            rounded = 'md',

            start,
            end,
            actions,
            controls,

            ...rest
        },
        ref,
    ) => {
        const selectRef = useRef<HTMLSelectElement>(null);

        const ctx = useFormFieldContext();
        const selectProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
                  'aria-invalid': ctx.hasError || invalid || undefined,
              }
            : { 'aria-invalid': invalid || undefined };

        const combinedRef = mergeRefs(selectRef, ref);

        const cl = clsx(className, prefix('--select-input'));

        const finalControls = (
            <>
                {controls}
                <TriangleDownIcon />
            </>
        );

        return (
            <FieldRoot
                className={cl}
                invalid={invalid}
                disabled={disabled}
                rounded={rounded}
                focusTargetRef={selectRef}
                start={start}
                end={end}
                actions={actions}
                controls={finalControls}
                variant={variant}
                size={size}
            >
                <Box
                    as="select"
                    ref={combinedRef}
                    className={prefix(`__field`)}
                    disabled={disabled}
                    aria-disabled={disabled || undefined}
                    {...rest}
                    {...selectProps}
                >
                    {children}
                </Box>
            </FieldRoot>
        );
    },
);

Select.displayName = 'Select';

export { Select };
