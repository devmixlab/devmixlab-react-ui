import React from 'react';
import { useFormFieldContext } from './FormField.context';
import { prefix } from './FormField.helpers';
import { Box } from '../../Box';
import type { BoxProps } from '../../Box';

type LabelProps = React.HTMLAttributes<HTMLLabelElement> & BoxProps;

const Label = ({ children, ...rest }: LabelProps) => {
    const ctx = useFormFieldContext();
    if (!ctx) return null;

    return (
        <Box as="label" htmlFor={ctx.id} className={prefix('__label')} {...rest}>
            {children}
            {ctx.required && (
                <span>
                    <span aria-hidden="true">&nbsp;*</span>
                    <span className={prefix('__sr-only')}> (required)</span>
                </span>
            )}
        </Box>
    );
};

Label.displayName = 'FormField.Label';

export { Label };

export type { LabelProps };
