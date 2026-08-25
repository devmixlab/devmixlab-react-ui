import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type PresenceState = 'entering' | 'entered' | 'exiting' | 'exited';

export type UsePresenceOptions = {
  present: boolean;

  reduceMotion?: boolean;

  enterDelay?: number;
  enterDuration?: number;
  exitDuration?: number;

  onMount?: () => void;
  onUnmount?: () => void;

  onEntered?: () => void;
  onExited?: () => void;
};

export type UsePresenceResult = {
  isMounted: boolean;
  state: PresenceState;
};

export function usePresence({
  present,

  reduceMotion,

  enterDelay = 0,
  enterDuration = 0,
  exitDuration = 80,

  onMount,
  onUnmount,

  onEntered,
  onExited,
}: UsePresenceOptions): UsePresenceResult {
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState<PresenceState>('exited');

  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMountRef = useRef(onMount);
  const onUnmountRef = useRef(onUnmount);
  const onEnteredRef = useRef(onEntered);
  const onExitedRef = useRef(onExited);

  useEffect(() => {
    onMountRef.current = onMount;
  }, [onMount]);

  useEffect(() => {
    onUnmountRef.current = onUnmount;
  }, [onUnmount]);

  useEffect(() => {
    onEnteredRef.current = onEntered;
  }, [onEntered]);

  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  const prefersReducedMotion = useReducedMotion();

  const motionReduced = reduceMotion ?? prefersReducedMotion;

  const finalEnterDuration = motionReduced ? 0 : enterDuration;
  const finalExitDuration = motionReduced ? 0 : exitDuration;

  const cancelPending = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    cancelPending();

    if (present) {
      const startEnter = () => {
        setIsMounted(true);
        onMountRef.current?.();

        if (motionReduced) {
          setState('entered');
          onEnteredRef.current?.();
          return;
        }

        setState('entering');

        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;

            timerRef.current = setTimeout(() => {
              timerRef.current = null;

              setState('entered');
              onEnteredRef.current?.();
            }, finalEnterDuration);
          });
        });
      };

      if (motionReduced) {
        startEnter();
      } else if (enterDelay > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          startEnter();
        }, enterDelay);
      } else {
        startEnter();
      }
    } else {
      if (motionReduced) {
        setState('exited');
        setIsMounted(false);

        onExitedRef.current?.();
        onUnmountRef.current?.();

        return;
      }

      setState((current) => {
        if (current === 'exited' || current === 'exiting') {
          return current;
        }

        timerRef.current = setTimeout(() => {
          timerRef.current = null;

          setState('exited');
          setIsMounted(false);

          onExitedRef.current?.();
          onUnmountRef.current?.();
        }, finalExitDuration);

        return 'exiting';
      });
    }

    return cancelPending;
  }, [present, enterDelay, motionReduced, finalEnterDuration, finalExitDuration, cancelPending]);

  return {
    isMounted,
    state,
  };
}
