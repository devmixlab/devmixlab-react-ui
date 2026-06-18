import { useCallback, useRef } from 'react';

export type UseCarouselDragOptions = {
    /** Ref to the scrollable track element. */
    trackRef: React.MutableRefObject<HTMLDivElement | null>;

    /** Whether drag interaction is enabled. */
    draggable?: boolean;

    /** Minimum pixel movement before a drag is registered. */
    dragThreshold?: number;

    /**
     * Minimum momentum velocity applied after release.
     * Flick gestures slower than this value will be boosted
     * to maintain a responsive feel.
     */
    minMomentumVelocity?: number;

    /** Skip momentum scrolling when true. */
    prefersReducedMotion?: boolean;

    onDragStart?: () => void;
    onDragEnd?: () => void;

    overscroll?: boolean;
};

export type UseCarouselDragReturn = {
    /** Call from onPointerDown — pass e.clientX. */
    startDrag: (clientX: number) => void;

    /** Call from a window pointermove listener — pass e.clientX. */
    moveDrag: (clientX: number) => void;

    /** Call from a window pointerup listener. */
    endDrag: () => void;

    /**
     * True if the pointer moved enough to be considered a drag.
     * Useful for swallowing accidental clicks.
     */
    draggedRef: React.MutableRefObject<boolean>;

    /** True while pointer/finger is actively down and dragging. */
    isPointerDownRef: React.MutableRefObject<boolean>;

    /** True while inertial momentum scrolling is active. */
    isMomentumRef: React.MutableRefObject<boolean>;

    /** Stop any running momentum animation. */
    stopMomentum: () => void;

    isOverscrollingRef: React.MutableRefObject<boolean>;
};

const MOMENTUM_START_THRESHOLD = 0.08;
const MOMENTUM_STOP_THRESHOLD = 0.02;
const MOMENTUM_DECAY = 0.965;
const MOMENTUM_MULTIPLIER = 18;

export function useCarouselDrag({
    trackRef,
    draggable = true,
    dragThreshold = 6,
    minMomentumVelocity = 0.32,
    prefersReducedMotion = false,
    overscroll = true,
    onDragStart,
    onDragEnd,
}: UseCarouselDragOptions): UseCarouselDragReturn {
    const draggedRef = useRef(false);

    const isOverscrollingRef = useRef(false);

    const isPointerDownRef = useRef(false);
    const isMomentumRef = useRef(false);

    const dragStartedRef = useRef(false);
    const dragEndedRef = useRef(false);

    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    const lastXRef = useRef(0);
    const lastTimeRef = useRef(0);

    const velocityRef = useRef(0);
    // const lastMoveTimeRef = useRef(0);
    // const lastMoveXRef = useRef(0);

    const overscrollRef = useRef(0);

    const momentumRef = useRef<number | null>(null);

    const stopMomentum = useCallback(() => {
        if (momentumRef.current !== null) {
            cancelAnimationFrame(momentumRef.current);
            momentumRef.current = null;
        }

        velocityRef.current = 0;

        isMomentumRef.current = false;
        isPointerDownRef.current = false;

        const el = trackRef.current;

        if (el) {
            el.style.transition = '';
            el.style.transform = '';
            el.style.scrollSnapType = 'x mandatory';
        }

        overscrollRef.current = 0;
    }, [trackRef]);

    const startDrag = useCallback(
        (clientX: number) => {
            const el = trackRef.current;

            if (!draggable || !el) return;

            stopMomentum();

            draggedRef.current = false;
            dragStartedRef.current = false;
            dragEndedRef.current = false;

            isPointerDownRef.current = true;
            isMomentumRef.current = false;

            startXRef.current = clientX;
            scrollLeftRef.current = el.scrollLeft;

            lastXRef.current = clientX;
            lastTimeRef.current = performance.now();

            velocityRef.current = 0;

            el.style.scrollSnapType = 'none';
            el.style.transition = '';

            document.body.style.userSelect = 'none';

            (
                document.body.style as CSSStyleDeclaration & {
                    webkitUserSelect: string;
                }
            ).webkitUserSelect = 'none';

            document.body.style.cursor = 'grabbing';

            onDragStart?.();
        },
        [trackRef, draggable, stopMomentum, onDragStart],
    );

    const moveDrag = useCallback(
        (clientX: number) => {
            const el = trackRef.current;

            if (!el || !isPointerDownRef.current) {
                return;
            }

            const delta = clientX - startXRef.current;

            if (!dragStartedRef.current) {
                if (Math.abs(delta) < dragThreshold) {
                    return;
                }

                dragStartedRef.current = true;
            }

            if (Math.abs(delta) > dragThreshold) {
                draggedRef.current = true;
            }

            const nextScroll = scrollLeftRef.current - delta;

            const maxScroll = el.scrollWidth - el.clientWidth;

            if (!overscroll) {
                overscrollRef.current = 0;
                isOverscrollingRef.current = false;

                el.style.transform = '';

                el.scrollLeft = Math.max(0, Math.min(nextScroll, maxScroll));
            } else {
                if (nextScroll < 0) {
                    overscrollRef.current = nextScroll * 0.35;
                    isOverscrollingRef.current = true;

                    el.scrollLeft = 0;
                } else if (nextScroll > maxScroll) {
                    overscrollRef.current = (nextScroll - maxScroll) * 0.35;
                    isOverscrollingRef.current = true;

                    el.scrollLeft = maxScroll;
                } else {
                    overscrollRef.current = 0;
                    isOverscrollingRef.current = false;

                    el.scrollLeft = nextScroll;
                }

                el.style.transform = `translateX(${-overscrollRef.current}px)`;
            }

            const now = performance.now();

            const dx = clientX - lastXRef.current;
            const dt = now - lastTimeRef.current;

            if (dt > 0) {
                velocityRef.current = dx / dt;
            }

            lastXRef.current = clientX;
            lastTimeRef.current = now;
        },
        [trackRef, dragThreshold, overscroll],
    );

    const endDrag = useCallback(() => {
        const el = trackRef.current;

        if (!el || !isPointerDownRef.current) {
            return;
        }

        isPointerDownRef.current = false;

        document.body.style.userSelect = '';

        (
            document.body.style as CSSStyleDeclaration & {
                webkitUserSelect: string;
            }
        ).webkitUserSelect = '';

        document.body.style.cursor = '';

        const finish = () => {
            isMomentumRef.current = false;

            el.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
            el.style.transform = 'translateX(0px)';

            window.setTimeout(() => {
                overscrollRef.current = 0;
                isOverscrollingRef.current = false;

                el.style.transition = '';
                el.style.transform = '';

                el.dispatchEvent(new Event('scroll'));
            }, 220);

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

        // immediate bounce-back when overscrolling edges
        if (overscroll && overscrollRef.current !== 0) {
            finish();
            return;
        }

        if (Math.abs(velocityRef.current) <= MOMENTUM_START_THRESHOLD) {
            finish();
            return;
        }

        isMomentumRef.current = true;

        if (Math.abs(velocityRef.current) < minMomentumVelocity) {
            velocityRef.current =
                velocityRef.current > 0 ? minMomentumVelocity : -minMomentumVelocity;
        }

        const momentum = () => {
            velocityRef.current *= MOMENTUM_DECAY;

            if (Math.abs(velocityRef.current) < MOMENTUM_STOP_THRESHOLD) {
                finish();
                return;
            }

            el.scrollLeft -= velocityRef.current * MOMENTUM_MULTIPLIER;

            momentumRef.current = requestAnimationFrame(momentum);
        };

        momentum();
    }, [trackRef, prefersReducedMotion, onDragEnd, overscroll, minMomentumVelocity]);

    return {
        startDrag,
        moveDrag,
        endDrag,
        draggedRef,
        isPointerDownRef,
        isMomentumRef,
        stopMomentum,
        isOverscrollingRef,
    };
}
