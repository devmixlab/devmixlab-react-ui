import React, { forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from '../Input/input.tokens';
import { prefix, getCount } from '../Input/input.helpers';
import { useFormFieldContext } from '../FormField/formField.context';
import { TriangleDown as TriangleDownIcon } from '../../Icon';
import { mergeRefs } from '../../utils/mergeRefs';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    variant?: Variant;
    size?: Size;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
            children,
            ...rest
        },
        ref,
    ) => {
        const ctx = useFormFieldContext();

        const selectRef = useRef<HTMLSelectElement>(null);
        const combinedRef = mergeRefs(selectRef, ref);

        const cl = clsx(
            className,
            prefix(),
            prefix('--select-input'),
            prefix(`--${variant}`),
            prefix(`--size-${size}`),
            {
                [prefix(`--invalid`)]: invalid,
                [prefix(`--disabled`)]: disabled,
                [prefix(`--has-start-adornment`)]: startAdornment,
                [prefix(`--has-end-adornment`)]: true, // always has arrow
            },
        );

        const startCount = getCount(startAdornment);
        const endCount = getCount(endAdornment) + 1;

        return (
            <Box
                className={cl}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                onMouseDown={(e) => {
                    if (disabled) return;
                    selectRef.current?.focus();
                }}
                rounded={rounded}
                style={
                    {
                        '--start-slot-count': startCount,
                        '--end-slot-count': endCount,
                    } as React.CSSProperties
                }
            >
                {startAdornment && (
                    <div className={clsx(prefix(`__slot`), prefix(`__slot-start`))}>
                        <span className={prefix(`__group`)}>{startAdornment}</span>
                    </div>
                )}

                <Box
                    as="select"
                    ref={combinedRef}
                    className={prefix(`__field`)}
                    disabled={disabled}
                    aria-disabled={disabled || undefined}
                    {...rest}
                    {...(ctx && {
                        id: rest.id ?? ctx.id,
                        'aria-describedby': ctx.describedBy,
                        'aria-invalid': ctx.hasError || invalid || undefined,
                    })}
                >
                    {children}
                </Box>

                <div className={clsx(prefix(`__slot`), prefix(`__slot-end`))}>
                    <span className={prefix(`__group`)}>
                        <TriangleDownIcon />
                    </span>

                    {endAdornment && <span className={prefix(`__group`)}>{endAdornment}</span>}
                </div>
            </Box>
        );
    },
);

Select.displayName = 'Select';

export { Select };
