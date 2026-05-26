import { useCallback, useRef } from 'react';

export type UseCarouselVisibilityOptions = {
    /** Ref to the scrollable track element. */
    trackRef: React.MutableRefObject<HTMLDivElement | null>;
    onVisibilityChange?: (visibleIndexes: number[]) => void;
    onSlideVisible?: (index: number) => void;
    onSlideHidden?: (index: number) => void;
};

export type UseCarouselVisibilityReturn = {
    /**
     * Call this after every scroll or resize event.
     * It diffs the previous visible set against the new one and fires the
     * appropriate callbacks only when something actually changes.
     */
    updateVisibility: () => void;
    /** Latest snapshot of visible slide indices. */
    visibleIndexesRef: React.MutableRefObject<number[]>;
};

/**
 * Tracks which carousel slides are currently visible inside the scroll
 * viewport and fires granular callbacks when that set changes.
 *
 * @example
 * const { updateVisibility, visibleIndexesRef } = useCarouselVisibility({
 *   trackRef,
 *   onSlideVisible: (i) => console.log('visible:', i),
 *   onSlideHidden:  (i) => console.log('hidden:', i),
 *   onVisibilityChange: (indexes) => console.log('visible set:', indexes),
 * });
 *
 * // Call updateVisibility() inside a scroll / resize handler.
 */
export function useCarouselVisibility({
    trackRef,
    onVisibilityChange,
    onSlideVisible,
    onSlideHidden,
}: UseCarouselVisibilityOptions): UseCarouselVisibilityReturn {
    const visibleIndexesRef = useRef<number[]>([]);

    const updateVisibility = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;

        const viewportLeft = el.scrollLeft;
        const viewportRight = viewportLeft + el.clientWidth;

        const nextVisible: number[] = [];

        Array.from(el.children).forEach((child, index) => {
            const slide = child as HTMLElement;
            const left = slide.offsetLeft;
            const right = left + slide.offsetWidth;
            const visible = right > viewportLeft && left < viewportRight;
            if (visible) nextVisible.push(index);
        });

        const prevVisible = visibleIndexesRef.current;

        const changed =
            prevVisible.length !== nextVisible.length ||
            prevVisible.some((v, i) => v !== nextVisible[i]);

        if (!changed) return;

        nextVisible.forEach((index) => {
            if (!prevVisible.includes(index)) onSlideVisible?.(index);
        });

        prevVisible.forEach((index) => {
            if (!nextVisible.includes(index)) onSlideHidden?.(index);
        });

        visibleIndexesRef.current = nextVisible;
        onVisibilityChange?.(nextVisible);
    }, [trackRef, onVisibilityChange, onSlideVisible, onSlideHidden]);

    return { updateVisibility, visibleIndexesRef };
}
