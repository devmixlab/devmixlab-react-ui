import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box } from '../Box';
import { Alert } from './Alert';
import { useAlert } from './useAlert';
import { classPrefix } from '../../utils/classPrefix';
import type { AlertHostName } from './Alert.types';

const prefix = (name = '') => classPrefix(`--alert-host${name}`);

export type AlertHostProps = {
  name?: AlertHostName;

  className?: string;

  /**
   * Vertical gap between alerts.
   */
  gap?: number | string;
};

const AlertHost = forwardRef<HTMLDivElement, AlertHostProps>(
  ({ name = 'default', className, gap = 12, ...props }, ref) => {
    const alert = useAlert();

    const alerts = alert.getAlerts(name);

    return (
      <Box
        ref={ref}
        className={clsx(prefix(), className)}
        display="flex"
        flexDirection="column"
        gap={gap}
        {...props}
      >
        {alerts.map((item) => (
          <Alert
            key={item.id}
            visible={item.visible}
            intent={item.intent}
            variant={item.variant}
            size={item.size}
            accent={item.accent}
            icon={item.icon}
            onDismiss={() => {
              item.onDismiss?.();
              alert.close(item.id);
            }}
            onExited={() => {
              // TODO:
              // alert.remove(item.id);
              console.log(alerts);
            }}
          >
            {(item.title || item.description) && (
              <>
                {item.title && <Alert.Title>{item.title}</Alert.Title>}

                {item.description && <Alert.Description>{item.description}</Alert.Description>}
              </>
            )}

            {item.actions && <Alert.Actions>{item.actions}</Alert.Actions>}
          </Alert>
        ))}
      </Box>
    );
  },
);

AlertHost.displayName = 'AlertHost';

export { AlertHost };
