import React, { createContext, useContext } from 'react';

// Define the context type
export type FormFieldContextValule = {
    id: string;
    hasError: boolean;
    describedBy?: string;
    required?: boolean;
    // setHintId: React.Dispatch<React.SetStateAction<string | undefined>>;
    // setErrorId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setHintId: (id?: string) => void;
    setErrorId: (id?: string) => void;
};

// Create the context with undefined as default
// This forces consumers to check/use the Provider
const FormFieldContext = createContext<FormFieldContextValule | undefined>(undefined);

// Helper hook to use the context safely
export const useFormFieldContext = (): FormFieldContextValule | undefined => {
    return useContext(FormFieldContext);
    // if (!context) {
    //     // throw new Error('FormFieldContext must be used within a <__Card.Provider>');
    // }
    // return context;
};

// Export the Provider for wrapping __FormField component
export const FormFieldProvider = FormFieldContext.Provider;
