import { alertIntents, alertVariants, alertSizes, alertAccents } from './Alert.constants';
import React from 'react';
import { TransitionProps } from '../Transition';
import type { BoxProps } from '../Box';
import { PolymorphicProps } from '../../types';

//-----------------------------------------------------------
// Types
//-----------------------------------------------------------

export type SemanticAlertIntent = (typeof alertIntents)[number];

export type AlertIntent = SemanticAlertIntent | (string & {});

export type AlertVariant = (typeof alertVariants)[number] | (string & {});

export type AlertSize = (typeof alertSizes)[number];

export type AlertAccent = (typeof alertAccents)[number];

export type OwnAlertProps = {
  intent?: AlertIntent;
  variant?: AlertVariant;
  size?: AlertSize;
  icon?: boolean | React.ReactNode;
  accent?: AlertAccent;

  onDismiss?: () => void;
};

export type AlertProps = OwnAlertProps & TransitionProps & Omit<BoxProps, 'size'>;

// export type ImplAlertProps = PolymorphicProps<'div', AlertProps>;
export type ImplAlertProps = AlertProps & {
  as?: React.ElementType;
} & React.ComponentProps<'div'>;
