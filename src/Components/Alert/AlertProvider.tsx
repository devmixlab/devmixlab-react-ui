import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertContext } from './AlertContext';
import type {
  AlertContextValue,
  AlertHandle,
  AlertHostName,
  AlertInstance,
  AlertOptions,
} from './Alert.types';
import { useTaskScheduler } from '../../hooks/useTaskScheduler';

type AlertProviderProps = {
  children: React.ReactNode;
  defaultHostName?: AlertHostName;
};

const AlertProvider = ({ children, defaultHostName = 'default' }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState(new Map<string, AlertInstance>());

  const alertRefs = useRef(new Map<string, HTMLElement>());

  const queue = useTaskScheduler();

  //-----------------------------------------------------------
  // Helpers
  //-----------------------------------------------------------

  const update = useCallback((id: string, options: Partial<AlertOptions>) => {
    updateAlert(id, options);
  }, []);

  const updateAlert = useCallback((id: string, options: Partial<AlertInstance>) => {
    setAlerts((prev) => {
      const next = new Map(prev);

      const previousAlert = next.get(id);

      if (!previousAlert) {
        return prev;
      }

      next.set(id, {
        ...previousAlert,
        ...options,
      });

      return next;
    });
  }, []);

  //-----------------------------------------------------------
  // Actions
  //-----------------------------------------------------------

  const remove = (id: string) => {
    setAlerts((prev) => {
      const next = new Map(prev);

      next.delete(id);

      return next;
    });
  };

  const pause = () => {
    queue.pause();
  };

  const resume = () => {
    queue.resume();
  };

  const close = useCallback((id: string) => {
    updateAlert(id, { visible: false });
  }, []);

  // const update = useCallback(
  //   (id: string, options: Partial<AlertOptions>) => {
  //     const hostName = findHost(id);
  //
  //     if (!hostName) return;
  //
  //     updateHost(hostName, (items) =>
  //       items.map((item) =>
  //         item.id === id
  //           ? {
  //               ...item,
  //               ...options,
  //             }
  //           : item,
  //       ),
  //     );
  //   },
  //   [findHost, updateHost],
  // );

  // const shake = useCallback((id: string) => {
  //   // implemented later
  // }, []);
  //
  // const focus = useCallback((id: string) => {
  //   alertRefs.current.get(id)?.focus();
  // }, []);

  const clear = useCallback(() => {
    setAlerts((prev) => {
      const next = new Map(prev);

      next.forEach((alert, id) => {
        next.set(id, {
          ...alert,
          visible: false,
        });
      });

      return next;
    });
  }, []);

  const closeHost = useCallback((hostName: AlertHostName) => {
    setAlerts((prev) => {
      const next = new Map(prev);

      next.forEach((alert, id) => {
        if (alert.hostName !== hostName) {
          return;
        }

        next.set(id, {
          ...alert,
          visible: false,
        });
      });

      return next;
    });
  }, []);

  const getHostAlerts = useCallback(
    (hostName: AlertHostName): AlertInstance[] => {
      const result: AlertInstance[] = [];

      alerts.forEach((alert) => {
        if (alert.hostName === hostName) {
          result.push(alert);
        }
      });

      return result;
    },
    [alerts],
  );

  const show = useCallback(
    ({ duration, ...options }: AlertOptions): AlertHandle => {
      const id = crypto.randomUUID();

      const hostName = options.hostName ?? defaultHostName;

      const alert: AlertInstance = {
        ...options,
        id,
        hostName,
        visible: true,
      };

      setAlerts((prev) => {
        const next = new Map(prev);

        next.set(id, alert);

        return next;
      });

      if (duration) {
        queue.add({
          id,
          delay: duration,
          onTrigger: () => {
            close(id);
          },
        });
      }

      return {
        id,

        close: () => close(id),

        update: (opts) => update(id, opts),

        // shake: () => shake(id),
        //
        // focus: () => focus(id),
      };
    },
    [close, defaultHostName, focus, update],
  );

  //-----------------------------------------------------------
  // Context
  //-----------------------------------------------------------

  const value = useMemo<AlertContextValue>(
    () => ({
      show,
      close,
      clear,
      closeHost,
      update,
      // shake,
      // focus,
      getHostAlerts,
      pause,
      resume,
      remove,
      // alerts,
    }),
    [show, close, clear, closeHost, update, focus, getHostAlerts],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export { AlertProvider };
