import React, { forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box';
import { useFormFieldContext } from '../FormField/FormField.context';
import { TriangleDown as TriangleDownIcon } from '../../Icon';
import { mergeRefs } from '../../../utils/mergeRefs';
import {
    FieldRoot,
    fieldRootPropKeys,
    type FieldLayoutProps,
    type SharedFieldRootProps,
} from '../FieldRoot';
import { classPrefix } from '../../../utils/classPrefix';
import { splitProps } from '../../../utils/splitProps';

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> &
    FieldLayoutProps &
    SharedFieldRootProps & {
        controls?: React.ReactNode;
    };

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            children,

            invalid = false,
            disabled = false,

            controls,

            ...rest
        },
        ref,
    ) => {
        const [fieldRootProps, controlProps] = splitProps(rest, fieldRootPropKeys);

        const selectRef = useRef<HTMLSelectElement>(null);

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;
        const selectProps = ctx
            ? {
                  ...controlProps,
                  id: rest.id ?? ctx.id,
                  'aria-describedby': ctx.describedBy,
              }
            : controlProps;

        const combinedRef = mergeRefs(selectRef, ref);

        const finalControls = (
            <>
                {controls}
                <TriangleDownIcon />
            </>
        );

        return (
            <FieldRoot
                className={clsx(classPrefix('--select'), className)}
                invalid={isInvalid}
                disabled={disabled}
                focusTargetRef={selectRef}
                controls={finalControls}
                {...fieldRootProps}
            >
                <Box
                    as="select"
                    ref={combinedRef}
                    className={classPrefix(`--field`)}
                    disabled={disabled}
                    aria-invalid={isInvalid || undefined}
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

export type { SelectProps };
