import React, { forwardRef, HTMLAttributes } from 'react';
import { createPolymorphic } from '../../types/polymorphic';
import { Box } from '../Box';
import type { BoxProps } from '../Box';
import clsx from 'clsx';
import { Info, Warning, Success, Close } from '../Icon';
import { TextProps, Text } from '../Text';
import { Transition } from '../Transition';
import { SemanticAlertIntent, AlertProps, ImplAlertProps } from './Alert.types';
import { prefix } from './Alert.helpers';

//-----------------------------------------------------------
// Types
//-----------------------------------------------------------

type AlertComponent = ReturnType<typeof createPolymorphic<AlertProps, 'div'>> & {
  Title: typeof AlertTitle;
  Description: typeof AlertDescription;
  Actions: typeof AlertActions;
};

//-----------------------------------------------------------
// Icons Map
//-----------------------------------------------------------

const defaultIcons: Record<SemanticAlertIntent, React.ReactNode> = {
  primary: null,
  secondary: null,
  success: <Success />,
  warning: <Warning />,
  danger: <Warning />,
  info: <Info />,
};

//-----------------------------------------------------------
// Implementation of component
//-----------------------------------------------------------
const AlertImpl = (
  {
    children,
    className,
    rounded = 'md',
    as,

    intent = 'primary',
    variant = 'subtle',
    size = 'md',
    icon,
    accent,

    onDismiss,

    ...rest
  }: ImplAlertProps,
  ref: React.Ref<HTMLDivElement>,
) => {
  const finalAs = as ?? Box;

  const isDismissible = onDismiss !== undefined;

  const resolvedIcon =
    icon === true ? (defaultIcons[intent as keyof typeof defaultIcons] ?? null) : (icon ?? null);

  return (
    <Transition
      {...rest}
      as={finalAs}
      ref={ref}
      className={clsx(prefix(), className)}
      rounded={rounded}
      data-intent={intent}
      data-variant={variant}
      data-size={size}
      data-accent={accent ?? undefined}
      data-has-icon={!!resolvedIcon || undefined}
    >
      {resolvedIcon != null && <Box className={prefix('__icon')}>{resolvedIcon}</Box>}

      <Box className={prefix('__content')}>{children}</Box>

      {isDismissible && (
        <Box className={prefix('__dismiss')}>
          <Box as="button" type="button" className={prefix('__dismiss-button')} onClick={onDismiss}>
            <Close />
          </Box>
        </Box>
      )}
    </Transition>
  );
};

//-----------------------------------------------------------
// AlertTitle component
//-----------------------------------------------------------
type AlertTitleProps = TextProps & HTMLAttributes<HTMLDivElement>;
const AlertTitle = ({ className, ...rest }: AlertTitleProps) => (
  // <Box {...rest} className={clsx(prefix('__title'), className)} />
  <Text
    {...rest}
    variant="body-md"
    emphasis="strong"
    className={clsx(prefix('__title'), className)}
  />
);

//-----------------------------------------------------------
// AlertDescription component
//-----------------------------------------------------------
type AlertDescriptionProps = TextProps & HTMLAttributes<HTMLDivElement>;
const AlertDescription = ({ className, ...rest }: AlertDescriptionProps) => (
  <Text
    {...rest}
    variant="body-sm"
    emphasis="muted"
    className={clsx(prefix('__description'), className)}
  />
);

//-----------------------------------------------------------
// AlertActions component
//-----------------------------------------------------------
type AlertActionsProps = {} & BoxProps & HTMLAttributes<HTMLDivElement>;
const AlertActions = ({ className, ...rest }: AlertActionsProps) => (
  <Box {...rest} className={clsx(prefix('__actions'), className)} />
);

//-----------------------------------------------------------
// Polymorphic component
//-----------------------------------------------------------
const Alert = createPolymorphic<AlertProps, 'div'>(
  forwardRef(AlertImpl),
  'Alert',
) as AlertComponent;

Alert.Title = AlertTitle;
Alert.Description = AlertDescription;
Alert.Actions = AlertActions;

export { Alert };
