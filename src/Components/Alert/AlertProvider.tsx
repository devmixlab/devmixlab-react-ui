import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AlertContext } from './AlertContext';
import type {
  AlertContextValue,
  AlertHandle,
  AlertHostName,
  AlertInstance,
  AlertOptions,
} from './Alert.types';
import { PendingClose } from '../Toast';

type AlertProviderProps = {
  children: React.ReactNode;
  defaultHostName?: AlertHostName;
};

export type PendingClose = {
  id: string;
  leftTillClose: number;
};

const AlertProvider = ({ children, defaultHostName = 'default' }: AlertProviderProps) => {
  const [alerts, setAlerts] = useState<Map<AlertHostName, AlertInstance[]>>(new Map());

  const alertRefs = useRef(new Map<string, HTMLElement>());
  const closeQueueRef = React.useRef<PendingClose[]>([]);

  //-----------------------------------------------------------
  // Helpers
  //-----------------------------------------------------------

  const updateHost = useCallback(
    (hostName: AlertHostName, updater: (alerts: AlertInstance[]) => AlertInstance[]) => {
      setAlerts((prev) => {
        const next = new Map(prev);

        const hostAlerts = next.get(hostName) ?? [];

        next.set(hostName, updater(hostAlerts));

        return next;
      });
    },
    [],
  );

  const findHost = useCallback(
    (id: string): AlertHostName | undefined => {
      for (const [hostName, hostAlerts] of alerts) {
        if (hostAlerts.some((x) => x.id === id)) {
          return hostName;
        }
      }

      return undefined;
    },
    [alerts],
  );

  //-----------------------------------------------------------
  // Actions
  //-----------------------------------------------------------

  const close = useCallback(
    (id: string) => {
      const hostName = findHost(id);

      if (!hostName) return;

      updateHost(hostName, (items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                visible: false,
              }
            : item,
        ),
      );
    },
    [findHost, updateHost],
  );

  const update = useCallback(
    (id: string, options: Partial<AlertOptions>) => {
      const hostName = findHost(id);

      if (!hostName) return;

      updateHost(hostName, (items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                ...options,
              }
            : item,
        ),
      );
    },
    [findHost, updateHost],
  );

  const shake = useCallback((id: string) => {
    // implemented later
  }, []);

  const focus = useCallback((id: string) => {
    alertRefs.current.get(id)?.focus();
  }, []);

  const clear = useCallback(() => {
    setAlerts((prev) => {
      const next = new Map(prev);

      next.forEach((items, hostName) => {
        next.set(
          hostName,
          items.map((item) => ({
            ...item,
            visible: false,
          })),
        );
      });

      return next;
    });
  }, []);

  const closeAll = useCallback(
    (hostName: AlertHostName) => {
      updateHost(hostName, (items) =>
        items.map((item) => ({
          ...item,
          visible: false,
        })),
      );
    },
    [updateHost],
  );

  const getAlerts = useCallback((hostName: AlertHostName) => alerts.get(hostName) ?? [], [alerts]);

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

      updateHost(hostName, (items) => [...items, alert]);

      if (duration) {
        requestClose(id);
      }

      return {
        id,

        close: () => close(id),

        update: (opts) => update(id, opts),

        shake: () => shake(id),

        focus: () => focus(id),
      };
    },
    [close, defaultHostName, focus, shake, update, updateHost],
  );

  //-----------------------------------------------------------
  // Context
  //-----------------------------------------------------------

  const value = useMemo<AlertContextValue>(
    () => ({
      show,
      close,
      clear,
      closeAll,
      update,
      shake,
      focus,
      getAlerts,
    }),
    [show, close, clear, closeAll, update, shake, focus, getAlerts],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export { AlertProvider };
