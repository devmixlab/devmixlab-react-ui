import React, { useEffect } from 'react';
import { useFormFieldContext } from './formField.context';
import { classPrefix } from '../../../utils/classPrefix';
import clsx from 'clsx';

const Error = ({ children }: { children: React.ReactNode }) => {
    const ctx = useFormFieldContext();
    if (!ctx || !children) return null;

    const id = `${ctx.id}-error`;

    useEffect(() => {
        ctx.setErrorId(id);
        return () => ctx.setErrorId(undefined);
    }, [id, ctx.setErrorId]);

    return (
        <div
            id={id}
            className={clsx(classPrefix('--error'), classPrefix('--message'))}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            {children}
        </div>
    );
};

Error.displayName = 'FormField.Error';

export { Error };
