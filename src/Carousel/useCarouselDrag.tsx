import { useCallback, useRef } from 'react';

export type UseCarouselDragOptions = {
    /** Ref to the scrollable track element. */
    trackRef: React.MutableRefObject<HTMLDivElement | null>;
    /** Whether drag interaction is enabled. */
    draggable?: boolean;
    /** Minimum pixel movement before a drag is registered. */
    dragThreshold?: number;
    /** Skip momentum scrolling when true (e.g. prefers-reduced-motion). */
    prefersReducedMotion?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
};

export type UseCarouselDragReturn = {
    /** Call from onPointerDown — pass e.clientX. */
    startDrag: (clientX: number) => void;
    /** Call from a window pointermove listener — pass e.clientX. */
    moveDrag: (clientX: number) => void;
    /** Call from a window pointerup listener. */
    endDrag: () => void;
    /**
     * True if the pointer moved enough to be considered a drag (not a click).
     * Use this inside onClickCapture to swallow spurious clicks.
     */
    draggedRef: React.MutableRefObject<boolean>;
    /** Stop any in-progress momentum animation. */
    stopMomentum: () => void;
};

/**
 * Encapsulates pointer-drag + momentum scrolling for a carousel track.
 *
 * @example
 * const { startDrag, moveDrag, endDrag, draggedRef } = useCarouselDrag({
 *   trackRef,
 *   draggable: true,
 *   dragThreshold: 6,
 *   prefersReducedMotion: false,
 *   onDragStart: () => console.log('drag started'),
 *   onDragEnd:   () => console.log('drag ended'),
 * });
 */
export function useCarouselDrag({
    trackRef,
    draggable = true,
    dragThreshold = 6,
    prefersReducedMotion = false,
    onDragStart,
    onDragEnd,
}: UseCarouselDragOptions): UseCarouselDragReturn {
    const isDraggingRef = useRef(false);
    const dragStartedRef = useRef(false); // threshold crossed?
    const draggedRef = useRef(false); // meaningful movement occurred
    const dragEndedRef = useRef(false);

    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const lastXRef = useRef(0);
    const lastTimeRef = useRef(0);
    const velocityRef = useRef(0);
    const momentumRef = useRef<number | null>(null);

    const stopMomentum = useCallback(() => {
        if (momentumRef.current !== null) {
            cancelAnimationFrame(momentumRef.current);
            momentumRef.current = null;
        }
    }, []);

    const startDrag = useCallback(
        (clientX: number) => {
            const el = trackRef.current;
            if (!draggable || !el) return;

            stopMomentum();

            dragEndedRef.current = false;
            dragStartedRef.current = false;
            draggedRef.current = false;
            isDraggingRef.current = true;

            startXRef.current = clientX;
            scrollLeftRef.current = el.scrollLeft;
            lastXRef.current = clientX;
            lastTimeRef.current = performance.now();
            velocityRef.current = 0;

            el.style.scrollSnapType = 'none';
            document.body.style.userSelect = 'none';
            (
                document.body.style as CSSStyleDeclaration & { webkitUserSelect: string }
            ).webkitUserSelect = 'none';
            document.body.style.cursor = 'grabbing';

            onDragStart?.();
        },
        [trackRef, draggable, stopMomentum, onDragStart],
    );

    const moveDrag = useCallback(
        (clientX: number) => {
            const el = trackRef.current;
            if (!el || !isDraggingRef.current) return;

            const delta = clientX - startXRef.current;

            if (!dragStartedRef.current) {
                if (Math.abs(delta) < dragThreshold) return;
                dragStartedRef.current = true;
            }

            if (Math.abs(delta) > dragThreshold) {
                draggedRef.current = true;
            }

            el.scrollLeft = scrollLeftRef.current - delta;

            const now = performance.now();
            const dx = clientX - lastXRef.current;
            const dt = now - lastTimeRef.current;
            if (dt > 0) velocityRef.current = dx / dt;

            lastXRef.current = clientX;
            lastTimeRef.current = now;
        },
        [trackRef, dragThreshold],
    );

    const endDrag = useCallback(() => {
        const el = trackRef.current;
        if (!el || !isDraggingRef.current) return;

        isDraggingRef.current = false;

        document.body.style.userSelect = '';
        (
            document.body.style as CSSStyleDeclaration & { webkitUserSelect: string }
        ).webkitUserSelect = '';
        document.body.style.cursor = '';

        const finish = () => {
            el.style.scrollSnapType = 'x mandatory';
            if (!dragEndedRef.current) {
                dragEndedRef.current = true;
                onDragEnd?.();
            }
        };

        if (prefersReducedMotion) {
            finish();
            return;
        }

        const momentum = () => {
            velocityRef.current *= 0.95;

            if (Math.abs(velocityRef.current) < 0.02) {
                finish();
                return;
            }

            el.scrollLeft -= velocityRef.current * 20;
            momentumRef.current = requestAnimationFrame(momentum);
        };

        momentum();
    }, [trackRef, prefersReducedMotion, onDragEnd]);

    return { startDrag, moveDrag, endDrag, draggedRef, stopMomentum };
}
