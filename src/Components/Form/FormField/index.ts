import { FormField as FormFieldBase, FormFieldProps, type FormFieldComponent } from './FormField';
import { Hint } from './Hint';
import { Label } from './Label';
import { Error } from './Error';

// Attach subcomponents
const CompFormField = FormFieldBase as FormFieldComponent;

CompFormField.Hint = Hint;
CompFormField.Label = Label;
CompFormField.Error = Error;

export { CompFormField as FormField };
