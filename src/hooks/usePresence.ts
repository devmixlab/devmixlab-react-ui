import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type PresenceState = 'entering' | 'entered' | 'exiting' | 'exited';

export type UsePresenceOptions = {
    /**
     * Whether the element should be present/visible.
     */
    present: boolean;

    /**
     * Duration (ms) for both enter and exit transitions.
     * The hook keeps the element mounted for this long after `present` becomes
     * false so CSS transitions have time to finish.
     * Pass 0 to skip animations (e.g. prefers-reduced-motion).
     * @default 200
     */
    duration?: number;

    /** Called once the element has fully entered. */
    onEntered?: () => void;

    /** Called once the element has fully exited, just before `isMounted` becomes false. */
    onExited?: () => void;
};

export type UsePresenceResult = {
    /**
     * Whether the element should exist in the DOM. Stays true through the exit
     * transition; becomes false only after the exit animation finishes.
     */
    isMounted: boolean;

    /**
     * Current phase of the lifecycle. Forward to a `data-*` attribute so CSS
     * transitions can key off it.
     *
     *   entering → initial hidden state, first paint
     *   entered  → visible resting state
     *   exiting  → animating back to hidden
     *   exited   → never seen in DOM (isMounted is false)
     */
    state: PresenceState;
};

/**
 * Manages a four-phase animation presence lifecycle for elements that need to
 * animate both in and out before being removed from the DOM.
 *
 * Enter sequence:
 *   present=true → state='entering' (paint) → rAF → state='entered'
 *
 * Exit sequence:
 *   present=false → state='exiting' → setTimeout(duration) → state='exited' → isMounted=false
 *
 * The rAF on enter guarantees the browser commits the 'entering' paint before
 * advancing to 'entered', giving CSS transitions a from-state to animate from.
 *
 * @example
 * const { isMounted, state } = usePresence({ present: open, duration: 200 });
 * if (!isMounted) return null;
 * return <div data-presence={state} />;
 *
 * // SCSS:
 * // .el { opacity: 0; transition: opacity 200ms ease; }
 * // .el[data-presence='entered'] { opacity: 1; }
 */
export function usePresence({
    present,
    duration = 200,
    onEntered,
    onExited,
}: UsePresenceOptions): UsePresenceResult {
    const [state, setState] = useState<PresenceState>(() => (present ? 'entering' : 'exited'));
    const [isMounted, setIsMounted] = useState(present);

    const rafRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const prefersReducedMotion = useReducedMotion();
    const finalDuration = prefersReducedMotion ? 0 : duration;

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
        if (present) {
            cancelPending();
            setIsMounted(true);
            setState('entering');

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                timerRef.current = setTimeout(() => {
                    timerRef.current = null;
                    setState('entered');
                    onEntered?.();
                }, finalDuration);
            });
        } else {
            cancelPending();

            // Functional update avoids reading stale state from the closure.
            setState((current) => {
                if (current === 'exited') return current;

                timerRef.current = setTimeout(() => {
                    timerRef.current = null;
                    setState('exited');
                    setIsMounted(false);
                    onExited?.();
                }, finalDuration);

                return 'exiting';
            });
        }

        return cancelPending;
    }, [present, finalDuration, cancelPending, onEntered, onExited]);

    return { isMounted, state };
}
