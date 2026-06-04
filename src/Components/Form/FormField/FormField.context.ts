import { createContext, useContext } from 'react';

//----------------------------------------------------------------------
// Context value
//----------------------------------------------------------------------
type FormFieldContextValule = {
    id: string;
    hasError: boolean;
    describedBy?: string;
    required?: boolean;
    setHintId: (id?: string) => void;
    setErrorId: (id?: string) => void;
};

//----------------------------------------------------------------------
// Context
//----------------------------------------------------------------------
const FormFieldContext = createContext<FormFieldContextValule | undefined>(undefined);

//----------------------------------------------------------------------
// Hook to use context safely
//----------------------------------------------------------------------
const useFormFieldContext = (): FormFieldContextValule | undefined => {
    return useContext(FormFieldContext);
    // if (!context) {
    //     // throw new Error('FormFieldContext must be used within a <__Card.Provider>');
    // }
    // return context;
};

//----------------------------------------------------------------------
// Provider
//----------------------------------------------------------------------
const FormFieldProvider = FormFieldContext.Provider;

export { FormFieldContext, useFormFieldContext, FormFieldProvider };

export type { FormFieldContextValule };
