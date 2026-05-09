import React, { forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size } from '../form.tokens';
import { useFormFieldContext } from '../FormField/formField.context';
import { TriangleDown as TriangleDownIcon } from '../../Icon';
import { mergeRefs } from '../../utils/mergeRefs';
import { FieldRoot } from '../FieldRoot/FieldRoot';
import { classPrefix } from '../../utils/classPrefix';
import { Variant } from '../FieldRoot/FieldRoot';

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
    variant?: Variant;
    size?: Size;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;
    controls?: React.ReactNode;
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
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;
        const selectProps = ctx
            ? {
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
              }
            : {};

        const combinedRef = mergeRefs(selectRef, ref);

        const cl = clsx(className, classPrefix('--select'));

        const finalControls = (
            <>
                {controls}
                <TriangleDownIcon />
            </>
        );

        return (
            <FieldRoot
                className={cl}
                invalid={isInvalid}
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
                    className={classPrefix(`--field`)}
                    disabled={disabled}
                    aria-invalid={isInvalid || undefined}
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
