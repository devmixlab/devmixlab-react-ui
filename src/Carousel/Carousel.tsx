// -----------------------------------------------------------------------------
// Carousel.tsx
// V1 — scroll snap carousel
// -----------------------------------------------------------------------------

import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--carousel${name}`);

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type CarouselContextValue = {
    trackRef: React.MutableRefObject<HTMLDivElement | null>;

    scrollPrev: () => void;
    scrollNext: () => void;

    canScrollPrev: boolean;
    canScrollNext: boolean;

    slidesPerView: number;
    slidesPerScroll: number;
    gap: number;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

const useCarouselContext = () => {
    const ctx = useContext(CarouselContext);

    if (!ctx) {
        throw new Error('Carousel components must be used inside <Carousel>');
    }

    return ctx;
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type CarouselProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        gap?: number;

        slidesPerView?: number;
        slidesPerScroll?: number;
    }
>;

type CarouselCompound = typeof CarouselRoot & {
    Track: typeof CarouselTrack;
    Item: typeof CarouselItem;
    Prev: typeof CarouselPrev;
    Next: typeof CarouselNext;
};

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

const CarouselRoot = forwardRef<HTMLDivElement, CarouselProps>(
    ({ children, className, gap = 4, slidesPerView = 1, slidesPerScroll = 1, ...rest }, ref) => {
        const trackRef = useRef<HTMLDivElement>(null);

        const [canScrollPrev, setCanScrollPrev] = useState(false);
        const [canScrollNext, setCanScrollNext] = useState(true);

        const getScrollAmount = useCallback(() => {
            const el = trackRef.current;

            if (!el) return 0;

            const totalGap = (slidesPerView - 1) * gap * 4;

            return (el.clientWidth - totalGap) / slidesPerView + gap * 4;
        }, [slidesPerView, gap]);

        const updateScrollState = useCallback(() => {
            const el = trackRef.current;

            if (!el) return;

            setCanScrollPrev(el.scrollLeft > 0);

            setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        }, []);

        const scrollPrev = useCallback(() => {
            const el = trackRef.current;

            if (!el) return;

            el.scrollBy({
                left: -(getScrollAmount() * slidesPerScroll),
                behavior: 'smooth',
            });
        }, [getScrollAmount, slidesPerScroll]);

        const scrollNext = useCallback(() => {
            const el = trackRef.current;

            if (!el) return;

            el.scrollBy({
                left: getScrollAmount() * slidesPerScroll,
                behavior: 'smooth',
            });
        }, [getScrollAmount, slidesPerScroll]);

        const value = useMemo(
            () => ({
                trackRef,
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,

                slidesPerView,
                slidesPerScroll,
                gap,
            }),
            [
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
                slidesPerView,
                slidesPerScroll,
                gap,
            ],
        );

        return (
            <CarouselContext.Provider value={value}>
                <Box ref={ref} className={clsx(prefix(), className)} pos="relative" {...rest}>
                    {children}

                    <ScrollWatcher onScroll={updateScrollState} />
                </Box>
            </CarouselContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Track
// -----------------------------------------------------------------------------

type CarouselTrackProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

const CarouselTrack = forwardRef<HTMLDivElement, CarouselTrackProps>(
    ({ children, className, ...rest }, ref) => {
        const { trackRef, gap } = useCarouselContext();

        return (
            <Box
                ref={(node: HTMLDivElement | null) => {
                    trackRef.current = node;

                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    }
                }}
                className={clsx(prefix('__track'), className)}
                display="flex"
                overflowX="auto"
                scrollSnapType="x mandatory"
                gap={gap}
                scrollBehavior="smooth"
                style={
                    {
                        '--carousel-gap': `${gap * 4}px`,
                    } as React.CSSProperties
                }
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

type CarouselItemProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

const CarouselItem = forwardRef<HTMLDivElement, CarouselItemProps>(
    ({ children, className, ...rest }, ref) => {
        const { slidesPerView } = useCarouselContext();

        return (
            <Box
                ref={ref}
                className={clsx(prefix('__item'), className)}
                flex={`0 0 calc(
                    (100% - (${slidesPerView} - 1) * var(--carousel-gap)) / ${slidesPerView}
                )`}
                scrollSnapAlign="start"
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Prev
// -----------------------------------------------------------------------------

type CarouselButtonProps<C extends React.ElementType = 'button'> = BoxComponentProps<C>;

const CarouselPrev = forwardRef<HTMLButtonElement, CarouselButtonProps>(
    ({ className, children = 'Prev', ...rest }, ref) => {
        const { scrollPrev, canScrollPrev } = useCarouselContext();

        return (
            <Box
                as="button"
                className={clsx(prefix('__control'), prefix('__control-prev'), className)}
                ref={ref}
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous slide"
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Next
// -----------------------------------------------------------------------------

const CarouselNext = forwardRef<HTMLButtonElement, CarouselButtonProps>(
    ({ className, children = 'Next', ...rest }, ref) => {
        const { scrollNext, canScrollNext } = useCarouselContext();

        return (
            <Box
                as="button"
                className={clsx(prefix('__control'), prefix('__control-next'), className)}
                ref={ref}
                type="button"
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next slide"
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Internal scroll watcher
// -----------------------------------------------------------------------------

const ScrollWatcher = ({ onScroll }: { onScroll: () => void }) => {
    const { trackRef } = useCarouselContext();

    React.useEffect(() => {
        const el = trackRef.current;

        if (!el) return;

        onScroll();

        el.addEventListener('scroll', onScroll, {
            passive: true,
        });

        window.addEventListener('resize', onScroll);

        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [trackRef, onScroll]);

    return null;
};

// -----------------------------------------------------------------------------
// Compound
// -----------------------------------------------------------------------------

export const Carousel = CarouselRoot as CarouselCompound;

Carousel.Track = CarouselTrack;
Carousel.Item = CarouselItem;
Carousel.Prev = CarouselPrev;
Carousel.Next = CarouselNext;
