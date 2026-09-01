import React, { useMemo } from 'react';
import { radioGroupContextValue, RadioGroupProvider } from './radioGroup.context';
import { Size } from './Radio';
import { CheckboxGroupContextValue } from '../Checkbox/CheckboxGroup.context';
import { Box, BoxProps } from '../../Box';

type Value = string;

// type RadioGroupProps<T extends Value> = {
//   value?: T | null;
//   name?: string;
//   size?: Size;
//   onValueChange?: (value: T) => void;
//   disabled?: boolean;
//   children: React.ReactNode;
//   readOnly?: boolean;
//   as?: React.ElementType;
// };

type RadioGroupOwnProps<T extends Value> = {
  value?: T | null;
  name?: string;
  size?: Size;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  children: React.ReactNode;
  readOnly?: boolean;
  as?: React.ElementType;
};

type RadioGroupProps<T extends Value> = RadioGroupOwnProps<T> &
  Omit<BoxProps, keyof RadioGroupOwnProps<any>>;

function RadioGroup<T extends Value>({
  as,
  value,
  name,
  size,
  onValueChange,
  children,
  disabled,
  readOnly,

  ...rest
}: RadioGroupProps<T>) {
  const ctx = useMemo(() => {
    const ctxValue = {
      value,
      name,
      size,
      onValueChange,
      disabled,
      readOnly,
    } satisfies radioGroupContextValue<T>;

    return ctxValue as radioGroupContextValue<unknown>;
  }, [value, name, size, disabled, readOnly, onValueChange]);

  return (
    <RadioGroupProvider value={ctx}>
      {/*<div role="radiogroup">{children}</div>*/}
      {as ? (
        <Box {...rest} as={as} role="radiogroup">
          {children}
        </Box>
      ) : (
        children
      )}
    </RadioGroupProvider>
  );
}

export { RadioGroup };

export type { RadioGroupProps };
