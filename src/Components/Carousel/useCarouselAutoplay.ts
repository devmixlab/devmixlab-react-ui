import { useCallback, useEffect, useRef } from 'react';

export type UseCarouselAutoplayOptions = {
    /** Whether autoplay is active. */
    autoplay: boolean;
    /** Current page index — used to advance to activeIndex + 1. */
    activeIndex: number;
    /** Total number of pages. */
    pageCount: number;
    /** Milliseconds between advances. */
    autoplayDelay?: number;
    /** Scroll animation duration (ms) used while autoplaying. */
    autoplaySpeed?: number;
    /** Pause while the carousel is hovered. */
    pauseOnHover?: boolean;
    /** Pause while a descendant has keyboard focus. */
    pauseOnFocus?: boolean;
    /** Whether to wrap from the last page back to the first. */
    loop?: boolean;
    /**
     * Imperative scroll callback — scrolls to the given page index
     * using the supplied speed.
     */
    scrollToPage: (index: number, speed?: number) => void;
    onAutoplayStart?: () => void;
    onAutoplayStop?: () => void;
};

export type UseCarouselAutoplayReturn = {
    /**
     * Attach to the carousel root's onMouseEnter / onMouseLeave so the
     * hook can pause on hover.
     */
    hoveredRef: React.MutableRefObject<boolean>;
    /**
     * Attach to the carousel root's onFocusCapture / onBlurCapture so the
     * hook can pause on focus.
     */
    focusedRef: React.MutableRefObject<boolean>;
};

/**
 * Drives carousel autoplay with optional pause-on-hover / pause-on-focus.
 *
 * @example
 * const { hoveredRef, focusedRef } = useCarouselAutoplay({
 *   autoplay: true,
 *   activeIndex,
 *   pageCount,
 *   autoplayDelay: 3000,
 *   autoplaySpeed: 600,
 *   pauseOnHover: true,
 *   pauseOnFocus: true,
 *   loop: true,
 *   scrollToPage,
 * });
 *
 * // In JSX:
 * <div
 *   onMouseEnter={() => { hoveredRef.current = true; }}
 *   onMouseLeave={() => { hoveredRef.current = false; }}
 *   onFocusCapture={() => { focusedRef.current = true; }}
 *   onBlurCapture={(e) => {
 *     if (!e.currentTarget.contains(e.relatedTarget as Node))
 *       focusedRef.current = false;
 *   }}
 * />
 */
export function useCarouselAutoplay({
    autoplay,
    activeIndex,
    pageCount,
    autoplayDelay = 3000,
    autoplaySpeed = 600,
    pauseOnHover = true,
    pauseOnFocus = true,
    loop = false,
    scrollToPage,
    onAutoplayStart,
    onAutoplayStop,
}: UseCarouselAutoplayOptions): UseCarouselAutoplayReturn {
    const hoveredRef = useRef(false);
    const focusedRef = useRef(false);
    const autoplayRunningRef = useRef(false);

    const autoplayNext = useCallback(() => {
        if ((pauseOnHover && hoveredRef.current) || (pauseOnFocus && focusedRef.current)) return;
        scrollToPage(activeIndex + 1, autoplaySpeed);
    }, [pauseOnHover, pauseOnFocus, scrollToPage, activeIndex, autoplaySpeed]);

    useEffect(() => {
        if (!autoplay) {
            if (autoplayRunningRef.current) {
                autoplayRunningRef.current = false;
                onAutoplayStop?.();
            }
            return;
        }

        autoplayRunningRef.current = true;
        onAutoplayStart?.();

        const id = window.setInterval(autoplayNext, autoplayDelay);

        return () => {
            clearInterval(id);
            if (autoplayRunningRef.current) {
                autoplayRunningRef.current = false;
                onAutoplayStop?.();
            }
        };
    }, [autoplay, autoplayDelay, autoplayNext, onAutoplayStart, onAutoplayStop]);

    return { hoveredRef, focusedRef };
}
