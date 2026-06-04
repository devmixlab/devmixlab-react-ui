import React, { useEffect } from 'react';
import { useFormFieldContext } from './FormField.context';
import { classPrefix } from '../../../utils/classPrefix';
import clsx from 'clsx';

const Hint = ({ children }: { children: React.ReactNode }) => {
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
        <div id={id} className={clsx(classPrefix('--hint'), classPrefix('--message'))}>
            {children}
        </div>
    );
};

Hint.displayName = 'FormField.Hint';

export { Hint };
