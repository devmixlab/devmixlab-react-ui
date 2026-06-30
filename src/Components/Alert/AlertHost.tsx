import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box, BoxProps } from '../Box';
import { Alert } from './Alert';
import { useAlert } from './useAlert';
import { classPrefix } from '../../utils/classPrefix';
import type { AlertHostName, AlertProps } from './Alert.types';

const prefix = (name = '') => classPrefix(`--alert-host${name}`);

export type AlertHostAlertProps = Pick<
  AlertProps,
  'rounded' | 'shadow' | 'variant' | 'intent' | 'size' | 'accent' | 'onDismiss'
>;

export type AlertHostOwnProps = {
  name?: AlertHostName;

  className?: string;

  /**
   * Vertical gap between alerts.
   */
  gap?: number | string;

  alertProps?: AlertHostAlertProps;
};

export type AlertHostProps = AlertHostOwnProps & BoxProps;

const AlertHost = forwardRef<HTMLDivElement, AlertHostProps>(
  ({ name = 'default', className, gap = 12, alertProps, ...rest }, ref) => {
    const alert = useAlert();

    const alerts = alert.getHostAlerts(name);

    return (
      <Box
        {...rest}
        ref={ref}
        className={clsx(prefix(), className)}
        display="flex"
        flexDirection="column"
        gap={gap}
        onMouseOver={(e) => {
          alert.pause();
        }}
        onMouseLeave={(e) => {
          alert.resume();
        }}
        data-alert-host={name}
      >
        {alerts.map((item) => {
          const onDismissResolved = item.onDismiss ?? alertProps?.onDismiss;

          return (
            <Alert
              key={item.id}
              visible={item.visible}
              intent={item.intent ?? alertProps?.intent}
              variant={item.variant ?? alertProps?.variant}
              size={item.size ?? alertProps?.size}
              accent={item.accent ?? alertProps?.accent}
              shadow={alertProps?.shadow}
              rounded={alertProps?.rounded}
              icon={item.icon}
              onDismiss={
                onDismissResolved
                  ? () => {
                      onDismissResolved();
                      alert.close(item.id);
                    }
                  : undefined
              }
              onExited={() => {
                // TODO:
                // alert.remove(item.id);
                console.log(alerts);
              }}
            >
              {(item.title || item.description) && (
                <>
                  {item.title && (
                    <Alert.Title>
                      {item.title} - {item.visible ? 'true' : 'false'}
                    </Alert.Title>
                  )}

                  {item.description && <Alert.Description>{item.description}</Alert.Description>}
                </>
              )}

              {item.actions && <Alert.Actions>{item.actions}</Alert.Actions>}
            </Alert>
          );
        })}
      </Box>
    );
  },
);

AlertHost.displayName = 'AlertHost';

export { AlertHost };
