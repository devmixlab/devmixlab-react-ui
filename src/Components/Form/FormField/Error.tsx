import React, { useEffect } from 'react';
import { useFormFieldContext } from './FormField.context';
import { Box } from '../../Box';
import type { BoxProps } from '../../Box';
import { prefix } from './FormField.helpers';
import clsx from 'clsx';

type ErrorProps = React.HTMLAttributes<HTMLDivElement> & BoxProps;

const Error = ({ children, ...rest }: ErrorProps) => {
    const ctx = useFormFieldContext();
    if (!ctx || !children) return null;

    const id = `${ctx.id}-error`;

    useEffect(() => {
        ctx.setErrorId(id);
        return () => ctx.setErrorId(undefined);
    }, [id, ctx.setErrorId]);

    return (
        <Box
            id={id}
            className={clsx(prefix('__error'), prefix('__message'))}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            {...rest}
        >
            {children}
        </Box>
    );
};

Error.displayName = 'FormField.Error';

export { Error };

export type { ErrorProps };
