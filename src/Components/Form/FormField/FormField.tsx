import React, { forwardRef, useMemo } from 'react';
import { FormFieldProvider, FormFieldContextValule } from './formField.context';
import { prefix } from './formField.helpers';
import clsx from 'clsx';
// import { Variant } from '../FieldRoot/FieldRoot';
import { Size } from '../form.tokens';
import { classPrefix } from '../../../utils/classPrefix';

export type FormFieldProps = {
    // variant?: Variant;
    size?: Size;
    id?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
};

export type FormFieldComponent = React.ForwardRefExoticComponent<
    FormFieldProps & React.RefAttributes<HTMLDivElement>
> & {
    Hint: React.FC<{ children: React.ReactNode }>;
    Label: React.FC<{ children: React.ReactNode }>;
    Error: React.FC<{ children: React.ReactNode }>;
};

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    (
        { size = 'md', className, required, children, id: idProp }: FormFieldProps,
        ref: React.Ref<HTMLDivElement>,
    ) => {
        const reactId = React.useId();
        const id = React.useMemo(() => idProp ?? reactId, [idProp, reactId]);
        // const id = idProp ?? reactId;

        const [hintId, setHintId] = React.useState<string | undefined>();
        const [errorId, setErrorId] = React.useState<string | undefined>();

        const describedBy = errorId || hintId;
        const hasError = !!errorId;

        const setHintIdSafe = React.useCallback((id?: string) => {
            setHintId(id);
        }, []);

        const setErrorIdSafe = React.useCallback((id?: string) => {
            setErrorId(id);
        }, []);

        const contextValue: FormFieldContextValule = useMemo(
            () => ({
                id,
                hasError,
                describedBy,
                required,
                setHintId: setHintIdSafe,
                setErrorId: setErrorIdSafe,
            }),
            [id, hasError, describedBy, required, setHintIdSafe, setErrorIdSafe],
        );

        return (
            <FormFieldProvider value={contextValue}>
                <div
                    ref={ref}
                    role="group"
                    className={clsx(classPrefix('--form-field'), className)}
                    data-invalid={hasError || undefined}
                    data-required={required || undefined}
                    data-size={size}
                >
                    {children}
                </div>
            </FormFieldProvider>
        );
    },
);

FormField.displayName = 'FormField';

export { FormField };
