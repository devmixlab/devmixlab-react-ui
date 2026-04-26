import React from 'react';
import { useFormFieldContext } from './formField.context';
import { prefix } from './formField.helpers';

const Label = ({ children }: { children: React.ReactNode }) => {
    const ctx = useFormFieldContext();
    if (!ctx) return null;

    return (
        <label htmlFor={ctx.id} className={prefix('__label')}>
            {children}
            {ctx.required && (
                <span>
                    <span aria-hidden="true">&nbsp;*</span>
                    <span className="sr-only"> (required)</span>
                </span>
            )}
        </label>
    );
};

Label.displayName = 'FormField.Label';

export { Label };
