import React, { useEffect } from 'react';
import { useFormFieldContext } from './formField.context';
import { prefix } from './formField.helpers';

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
            className={prefix('__error')}
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
