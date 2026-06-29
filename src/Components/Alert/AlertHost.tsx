import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box } from '../Box';
import { Alert } from './Alert';
import { useAlert } from './useAlert';
import { classPrefix } from '../../utils/classPrefix';
import type { AlertHostName, AlertProps } from './Alert.types';

const prefix = (name = '') => classPrefix(`--alert-host${name}`);

export type AlertHostAlertProps = Pick<
  AlertProps,
  'rounded' | 'shadow' | 'variant' | 'intent' | 'size' | 'accent' | 'onDismiss'
>;

export type AlertHostProps = {
  name?: AlertHostName;

  className?: string;

  /**
   * Vertical gap between alerts.
   */
  gap?: number | string;

  alertProps?: AlertHostAlertProps;
};

const AlertHost = forwardRef<HTMLDivElement, AlertHostProps>(
  ({ name = 'default', className, gap = 12, alertProps }, ref) => {
    const alert = useAlert();

    const alerts = alert.getHostAlerts(name);

    console.log(alerts);
    // const alerts = alert.alerts.get(name) ?? [];

    // const onDismissResolved =

    return (
      <Box
        ref={ref}
        className={clsx(prefix(), className)}
        display="flex"
        flexDirection="column"
        gap={gap}
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
