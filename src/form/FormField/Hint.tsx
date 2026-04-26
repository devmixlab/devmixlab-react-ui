import React, { useEffect } from 'react';
import { useFormFieldContext } from './formField.context';
import { prefix } from './formField.helpers';

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
        <div id={id} className={prefix('__hint')}>
            {children}
        </div>
    );
};

Hint.displayName = 'FormField.Hint';

export { Hint };
