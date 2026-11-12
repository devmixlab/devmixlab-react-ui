import React, { createContext, useContext, type MutableRefObject } from 'react';

import {
  ToastOptions,
  ToastHandle,
  ToastControlRef,
  PendingClose,
  ToastPosition,
} from './ToastProvider';

// ---------------------------------
// Types
// ---------------------------------

export type ToastRecord = ToastOptions & {
  id: string;
  closing?: boolean;
};

export type ToastStateContextValue = {
  position: ToastPosition;
  toasts: ToastRecord[];
  isPaused: boolean;
  minCloseInterval: number;
  toastControlRefs: MutableRefObject<Map<string, ToastControlRef>>;
  closeQueueRef: MutableRefObject<PendingClose[]>;
};

export type ToastActionsContextValue = {
  remove: (id: string) => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
  show: (options: ToastOptions) => ToastHandle;
  requestClose: (id: string) => void;
  close: (id: string) => void;
  clear: () => void;
  pauseAll: () => void;
  resumeAll: () => void;
};

// ---------------------------------
// Contexts
// ---------------------------------

export const ToastStateContext = createContext<ToastStateContextValue | null>(null);

export const ToastActionsContext = createContext<ToastActionsContextValue | null>(null);

// ---------------------------------
// Hooks
// ---------------------------------

export function useToastState() {
  const context = useContext(ToastStateContext);

  if (!context) {
    throw new Error('useToastState must be used within ToastProvider.');
  }

  return context;
}

export function useToastActions() {
  const context = useContext(ToastActionsContext);

  if (!context) {
    throw new Error('useToastActions must be used within ToastProvider.');
  }

  return context;
}
