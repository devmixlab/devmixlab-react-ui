import { alertIntents, alertVariants, alertSizes, alertAccents } from './Alert.constants';
import React from 'react';
import { TransitionProps } from '../Transition';
import type { BoxProps } from '../Box';

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

// export type ImplAlertProps = AlertProps & {
//   as?: React.ElementType;
// } & React.ComponentProps<'div'>;

export type ImplAlertProps = AlertProps &
  Omit<React.ComponentProps<'div'>, keyof AlertProps> & {
    as?: React.ElementType;
  };

//-----------------------------------------------------------
// Alert system
//-----------------------------------------------------------

export type AlertHostName = string;

export type AlertOptions = {
  /**
   * AlertHost name.
   * Defaults to "default".
   */
  hostName?: AlertHostName;

  intent?: AlertIntent;
  variant?: AlertVariant;
  size?: AlertSize;
  accent?: AlertAccent;

  icon?: boolean | React.ReactNode;

  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;

  /*
   * transition properties
   */
  animateOnMount?: boolean;

  /**
   * Auto close duration in milliseconds.
   *
   * undefined -> provider default
   * null -> never auto close
   */
  duration?: number | null;

  onDismiss?: () => void;
};

export type AlertInstance = Omit<AlertOptions, 'hostName'> & {
  id: string;

  /**
   * Target AlertHost.
   */
  hostName: AlertHostName;

  /**
   * Controls enter / exit transition.
   */
  visible: boolean;
};

export type AlertHandle = {
  readonly id: string;

  /**
   * Starts exit transition.
   */
  close(): void;

  /**
   * Updates alert properties.
   */
  update(options: Partial<AlertOptions>): void;

  /**
   * Plays attention animation.
   */
  // shake(): void;

  /**
   * Focuses the alert element.
   */
  // focus(): void;
};

export type AlertContextValue = {
  /**
   * Creates a new alert.
   */
  show(options: AlertOptions): AlertHandle;

  /**
   * Closes a single alert.
   */
  close(id: string): void;

  /**
   * Closes every alert in every host.
   */
  clear(): void;

  /**
   * Closes all alerts in a host.
   */
  closeHost(hostName: AlertHostName): void;

  /**
   * Updates an existing alert.
   */
  update(id: string, options: Partial<AlertOptions>): void;

  /**
   * Plays the attention animation.
   */
  // shake(id: string): void;

  /**
   * Focuses an alert.
   */
  // focus(id: string): void;

  /**
   * Returns alerts assigned to a host.
   */
  getHostAlerts(hostName: AlertHostName): readonly AlertInstance[];

  pause: () => void;
  resume: () => void;

  remove: (id: string) => void;
};
