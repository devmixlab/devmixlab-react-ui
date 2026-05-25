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

    activeIndex: number;
    pageCount: number;

    scrollTo: (index: number) => void;
    updatePageCount: () => void;
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
    Indicators: typeof CarouselIndicators;
};

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

const CarouselRoot = forwardRef<HTMLDivElement, CarouselProps>(
    ({ children, className, gap = 4, slidesPerView = 1, slidesPerScroll = 1, ...rest }, ref) => {
        const trackRef = useRef<HTMLDivElement>(null);

        const [activeIndex, setActiveIndex] = useState(0);
        const [pageCount, setPageCount] = useState(0);

        const [canScrollPrev, setCanScrollPrev] = useState(false);
        const [canScrollNext, setCanScrollNext] = useState(true);

        const getPageCount = useCallback(() => {
            const el = trackRef.current;

            if (!el) return 0;

            const totalSlides = el.children.length;

            const maxIndex = Math.max(0, totalSlides - slidesPerView);

            return Math.floor(maxIndex / slidesPerScroll) + 1;
        }, [slidesPerScroll, slidesPerView]);

        const updatePageCount = useCallback(() => {
            setPageCount(getPageCount());
        }, [getPageCount]);

        const getScrollAmount = useCallback(() => {
            const el = trackRef.current;

            if (!el) return 0;

            const totalGap = (slidesPerView - 1) * gap * 4;

            return (el.clientWidth - totalGap) / slidesPerView + gap * 4;
        }, [slidesPerView, gap]);

        const scrollTo = useCallback(
            (index: number) => {
                const el = trackRef.current;

                if (!el) return;

                const maxScrollLeft = el.scrollWidth - el.clientWidth;

                const target = getScrollAmount() * slidesPerScroll * index;

                el.scrollTo({
                    left: Math.min(target, maxScrollLeft),
                    behavior: 'smooth',
                });
            },
            [getScrollAmount, slidesPerScroll],
        );

        const updateScrollState = useCallback(() => {
            const el = trackRef.current;

            if (!el) return;

            const scrollPerPage = getScrollAmount() * slidesPerScroll;

            const safePageCount = Math.max(1, pageCount);

            const currentIndex =
                scrollPerPage === 0
                    ? 0
                    : Math.min(safePageCount - 1, Math.round(el.scrollLeft / scrollPerPage));

            setActiveIndex(currentIndex);

            setCanScrollPrev(el.scrollLeft > 0);

            setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        }, [getScrollAmount, slidesPerScroll, pageCount]);

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

                activeIndex,
                pageCount,
                scrollTo,

                updatePageCount,
            }),
            [
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
                slidesPerView,
                slidesPerScroll,
                gap,
                activeIndex,
                pageCount,
                scrollTo,
                updatePageCount,
            ],
        );

        return (
            <CarouselContext.Provider value={value}>
                <Box
                    ref={ref}
                    className={clsx(prefix(), className)}
                    pos="relative"
                    role="region"
                    aria-roledescription="carousel"
                    {...rest}
                >
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
        const { trackRef, gap, scrollPrev, scrollNext } = useCarouselContext();

        const handleKeyDown = useCallback(
            (event: React.KeyboardEvent<HTMLDivElement>) => {
                switch (event.key) {
                    case 'ArrowLeft': {
                        event.preventDefault();

                        scrollPrev();

                        break;
                    }

                    case 'ArrowRight': {
                        event.preventDefault();

                        scrollNext();

                        break;
                    }

                    case 'Home': {
                        event.preventDefault();

                        trackRef.current?.scrollTo({
                            left: 0,
                            behavior: 'smooth',
                        });

                        break;
                    }

                    case 'End': {
                        const el = trackRef.current;

                        if (!el) return;

                        event.preventDefault();

                        el.scrollTo({
                            left: el.scrollWidth,
                            behavior: 'smooth',
                        });

                        break;
                    }
                }
            },
            [scrollPrev, scrollNext, trackRef],
        );

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
                tabIndex={0}
                onKeyDown={handleKeyDown}
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
// Indicators
// -----------------------------------------------------------------------------

type CarouselIndicatorsProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

const CarouselIndicators = forwardRef<HTMLDivElement, CarouselIndicatorsProps>(
    ({ className, ...rest }, ref) => {
        const { activeIndex, pageCount, scrollTo } = useCarouselContext();

        return (
            <Box
                ref={ref}
                className={clsx(prefix('__indicators'), className)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                {...rest}
            >
                {Array.from({ length: pageCount }).map((_, index) => {
                    const active = index === activeIndex;

                    return (
                        <Box
                            key={index}
                            as="button"
                            type="button"
                            className={clsx(
                                prefix('__indicator'),
                                active && prefix('__indicator-active'),
                            )}
                            aria-label={`Go to page ${index + 1}`}
                            aria-current={active}
                            onClick={() => scrollTo(index)}
                        />
                    );
                })}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Internal scroll watcher
// -----------------------------------------------------------------------------

const ScrollWatcher = ({ onScroll }: { onScroll: () => void }) => {
    const { trackRef, updatePageCount } = useCarouselContext();

    const handleResize = useCallback(() => {
        updatePageCount();

        requestAnimationFrame(onScroll);
    }, [updatePageCount, onScroll]);

    React.useEffect(() => {
        const el = trackRef.current;

        if (!el) return;

        handleResize();

        el.addEventListener('scroll', onScroll, {
            passive: true,
        });

        window.addEventListener('resize', handleResize);

        return () => {
            el.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [trackRef, handleResize, onScroll]);

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
Carousel.Indicators = CarouselIndicators;
