import React, { forwardRef, useMemo } from 'react';
import { FormFieldProvider, FormFieldContextValule } from './FormField.context';
import { prefix } from './FormField.helpers';
import clsx from 'clsx';
import { Size } from '../form.tokens';
import { HintProps } from './Hint';
import { LabelProps } from './Label';
import { ErrorProps } from './Error';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------
type OwnFormFieldProps = {
    size?: Size;
    required?: boolean;
};

type FormFieldProps = React.HTMLAttributes<HTMLDivElement> & OwnFormFieldProps;

type FormFieldComponent = React.ForwardRefExoticComponent<
    FormFieldProps & React.RefAttributes<HTMLDivElement>
> & {
    Hint: React.FC<HintProps>;
    Label: React.FC<LabelProps>;
    Error: React.FC<ErrorProps>;
};

//----------------------------------------------------------------------
// Component
//----------------------------------------------------------------------
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
                    className={clsx(prefix(), className)}
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

export type { FormFieldProps, FormFieldComponent };
