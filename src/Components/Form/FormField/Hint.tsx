import React, { useEffect } from 'react';
import { useFormFieldContext } from './FormField.context';
import { prefix } from './FormField.helpers';
import clsx from 'clsx';
import { Box } from '../../Box';
import type { BoxProps } from '../../Box';

type HintProps = React.HTMLAttributes<HTMLDivElement> & BoxProps;

const Hint = ({ children, ...rest }: HintProps) => {
    const ctx = useFormFieldContext();
    if (!ctx) return null;

    const id = `${ctx.id}-hint`;

    useEffect(() => {
        ctx.setHintId(id);
        return () => ctx.setHintId(undefined);
    }, [id, ctx.setHintId]);

    // 👇 render logic AFTER registration
    if (ctx.hasError) return null;

    return (
        <Box id={id} className={clsx(prefix('__hint'), prefix('__message'))} {...rest}>
            {children}
        </Box>
    );
};

Hint.displayName = 'FormField.Hint';

export { Hint };

export type { HintProps };
