import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type PresenceState = 'entering' | 'entered' | 'exiting' | 'exited';

export type UsePresenceOptions = {
    /**
     * Whether the element should be present/visible.
     */
    present: boolean;

    /**
     * Delay (ms) before the element transitions from
     * 'entering' → 'entered'.
     *
     * Useful for slower/modal-like transitions.
     *
     * @default 0
     */
    enterDuration?: number;

    /**
     * Duration (ms) for the exit transition.
     * The element stays mounted for this long after `present`
     * becomes false so exit animations can finish.
     *
     * @default 80
     */
    exitDuration?: number;

    /** Called once the element has mounted. */
    onMount?: () => void;

    /** Called once the element has unmounted. */
    onUnmount?: () => void;

    /** Called once the element has fully entered. */
    onEntered?: () => void;

    /** Called once the element has fully exited. */
    onExited?: () => void;
};

export type UsePresenceResult = {
    /**
     * Whether the element should exist in the DOM.
     */
    isMounted: boolean;

    /**
     * Current transition phase.
     */
    state: PresenceState;
};

export function usePresence({
    present,

    enterDuration = 0,
    exitDuration = 80,

    onMount,
    onUnmount,

    onEntered,
    onExited,
}: UsePresenceOptions): UsePresenceResult {
    const [state, setState] = useState<PresenceState>(() => (present ? 'entering' : 'exited'));

    const [isMounted, setIsMounted] = useState(present);

    const rafRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep latest callbacks without restarting effects.
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

    const finalEnterDuration = prefersReducedMotion ? 0 : enterDuration;
    const finalExitDuration = prefersReducedMotion ? 0 : exitDuration;

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
            const wasMounted = isMounted;

            setIsMounted(true);

            if (!wasMounted) {
                onMountRef.current?.();
            }

            setState((current) => {
                // Already visible.
                if (current === 'entering' || current === 'entered') {
                    return current;
                }

                return 'entering';
            });

            // Double RAF guarantees browser paints
            // the entering state before transitioning.
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
        } else {
            setState((current) => {
                // Already gone.
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
    }, [present, isMounted, finalEnterDuration, finalExitDuration, cancelPending]);

    return {
        isMounted,
        state,
    };
}

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { useReducedMotion } from './useReducedMotion';
//
// export type PresenceState = 'entering' | 'entered' | 'exiting' | 'exited';
//
// export type UsePresenceOptions = {
//     /**
//      * Whether the element should be present/visible.
//      */
//     present: boolean;
//
//     /**
//      * Delay (ms) before the element transitions from
//      * 'entering' → 'entered'.
//      *
//      * Useful for slower/modal-like transitions.
//      *
//      * @default 0
//      */
//     enterDuration?: number;
//
//     /**
//      * Duration (ms) for the exit transition.
//      * The element stays mounted for this long after `present`
//      * becomes false so exit animations can finish.
//      *
//      * @default 80
//      */
//     exitDuration?: number;
//
//     /** Called once the element has fully entered. */
//     onEntered?: () => void;
//
//     /** Called once the element has fully exited. */
//     onExited?: () => void;
// };
//
// export type UsePresenceResult = {
//     /**
//      * Whether the element should exist in the DOM.
//      */
//     isMounted: boolean;
//
//     /**
//      * Current transition phase.
//      */
//     state: PresenceState;
// };
//
// export function usePresence({
//     present,
//
//     enterDuration = 0,
//     exitDuration = 80,
//
//     onEntered,
//     onExited,
// }: UsePresenceOptions): UsePresenceResult {
//     const [state, setState] = useState<PresenceState>(() => (present ? 'entering' : 'exited'));
//
//     const [isMounted, setIsMounted] = useState(present);
//
//     const rafRef = useRef<number | null>(null);
//     const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//
//     // Keep latest callbacks without restarting effects.
//     const onEnteredRef = useRef(onEntered);
//     const onExitedRef = useRef(onExited);
//
//     useEffect(() => {
//         onEnteredRef.current = onEntered;
//     }, [onEntered]);
//
//     useEffect(() => {
//         onExitedRef.current = onExited;
//     }, [onExited]);
//
//     const prefersReducedMotion = useReducedMotion();
//
//     const finalEnterDuration = prefersReducedMotion ? 0 : enterDuration;
//     const finalExitDuration = prefersReducedMotion ? 0 : exitDuration;
//
//     const cancelPending = useCallback(() => {
//         if (rafRef.current !== null) {
//             cancelAnimationFrame(rafRef.current);
//             rafRef.current = null;
//         }
//
//         if (timerRef.current !== null) {
//             clearTimeout(timerRef.current);
//             timerRef.current = null;
//         }
//     }, []);
//
//     useEffect(() => {
//         cancelPending();
//
//         if (present) {
//             setIsMounted(true);
//
//             setState((current) => {
//                 // Already visible.
//                 if (current === 'entering' || current === 'entered') {
//                     return current;
//                 }
//
//                 return 'entering';
//             });
//
//             // Double RAF guarantees browser paints
//             // the entering state before transitioning.
//             rafRef.current = requestAnimationFrame(() => {
//                 rafRef.current = requestAnimationFrame(() => {
//                     rafRef.current = null;
//
//                     timerRef.current = setTimeout(() => {
//                         timerRef.current = null;
//
//                         setState('entered');
//
//                         onEnteredRef.current?.();
//                     }, finalEnterDuration);
//                 });
//             });
//         } else {
//             setState((current) => {
//                 // Already gone.
//                 if (current === 'exited' || current === 'exiting') {
//                     return current;
//                 }
//
//                 timerRef.current = setTimeout(() => {
//                     timerRef.current = null;
//
//                     setState('exited');
//                     setIsMounted(false);
//
//                     onExitedRef.current?.();
//                 }, finalExitDuration);
//
//                 return 'exiting';
//             });
//         }
//
//         return cancelPending;
//     }, [present, finalEnterDuration, finalExitDuration, cancelPending]);
//
//     return {
//         isMounted,
//         state,
//     };
// }
