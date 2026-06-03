import React from 'react';
import { useFormFieldContext } from './formField.context';
import { classPrefix } from '../../../utils/classPrefix';

const Label = ({ children }: { children: React.ReactNode }) => {
    const ctx = useFormFieldContext();
    if (!ctx) return null;

    return (
        <label htmlFor={ctx.id} className={classPrefix('--label')}>
            {children}
            {ctx.required && (
                <span>
                    <span aria-hidden="true">&nbsp;*</span>
                    <span className={classPrefix('--sr-only')}> (required)</span>
                </span>
            )}
        </label>
    );
};

Label.displayName = 'FormField.Label';

export { Label };
