import { useCallback } from 'react';

export type UseCarouselKeyboardOptions = {
    /** Current page index. */
    activeIndex: number;
    /** Total number of pages. */
    pageCount: number;
    /** Whether to wrap around at boundaries. */
    loop?: boolean;
    /**
     * Imperative scroll callback — scrolls to the given page index with an
     * optional speed override (ms). Pass a low value for key-repeat events.
     */
    scrollTo: (index: number, speed?: number) => void;
};

export type UseCarouselKeyboardReturn = {
    /**
     * Attach to the carousel track's onKeyDown handler.
     * Handles ArrowLeft, ArrowRight, Home, End.
     */
    handleKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
};

/**
 * Provides keyboard navigation for a carousel track (or control button).
 *
 * Supports ArrowLeft / ArrowRight (with key-repeat fast-scroll at 80 ms),
 * Home (first slide), and End (last slide).
 *
 * @example
 * const { handleKeyDown } = useCarouselKeyboard({
 *   activeIndex,
 *   pageCount,
 *   loop: true,
 *   scrollTo,
 * });
 *
 * // In JSX:
 * <div tabIndex={0} onKeyDown={handleKeyDown} />
 */
export function useCarouselKeyboard({
    activeIndex,
    pageCount,
    loop = false,
    scrollTo,
}: UseCarouselKeyboardOptions): UseCarouselKeyboardReturn {
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLElement>) => {
            switch (event.key) {
                case 'ArrowLeft': {
                    event.preventDefault();

                    const prev = loop
                        ? (activeIndex - 1 + pageCount) % pageCount
                        : Math.max(0, pageCount === 0 ? 0 : activeIndex - 1);

                    scrollTo(prev, event.repeat ? 80 : undefined);
                    break;
                }

                case 'ArrowRight': {
                    event.preventDefault();

                    const next = loop
                        ? pageCount === 0
                            ? 0
                            : (activeIndex + 1) % pageCount
                        : Math.min(pageCount - 1, activeIndex + 1);

                    scrollTo(next, event.repeat ? 80 : undefined);
                    break;
                }

                case 'Home': {
                    event.preventDefault();
                    scrollTo(0);
                    break;
                }

                case 'End': {
                    event.preventDefault();
                    scrollTo(pageCount - 1);
                    break;
                }
            }
        },
        [activeIndex, pageCount, loop, scrollTo],
    );

    return { handleKeyDown };
}
