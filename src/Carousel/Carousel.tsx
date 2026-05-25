// -----------------------------------------------------------------------------
// Carousel.tsx
// V2 — loop support + consistent navigation
// -----------------------------------------------------------------------------

import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    useEffect,
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

    draggable: boolean;
    prefersReducedMotion: boolean;
    dragThreshold: number;

    loop: boolean;
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

        autoplay?: boolean;
        autoplayDelay?: number;
        pauseOnHover?: boolean;
        pauseOnFocus?: boolean;

        draggable?: boolean;

        disableMotion?: boolean;

        dragThreshold?: number;

        loop?: boolean;
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
    (
        {
            children,
            className,

            gap = 4,

            slidesPerView = 1,
            slidesPerScroll = 1,

            autoplay = false,
            autoplayDelay = 3000,

            pauseOnHover = true,
            pauseOnFocus = true,

            draggable = true,

            disableMotion = false,

            dragThreshold = 6,

            loop = false,

            ...rest
        },
        ref,
    ) => {
        const [reducedMotion, setReducedMotion] = useState(() => {
            if (typeof window === 'undefined') {
                return false;
            }

            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        });

        const prefersReducedMotion = reducedMotion || disableMotion;

        useEffect(() => {
            const media = window.matchMedia('(prefers-reduced-motion: reduce)');

            const update = () => {
                setReducedMotion(media.matches);
            };

            update();

            media.addEventListener('change', update);

            return () => {
                media.removeEventListener('change', update);
            };
        }, []);

        const trackRef = useRef<HTMLDivElement>(null);

        const autoplayRef = useRef<number | null>(null);

        const hoveredRef = useRef(false);

        const focusedRef = useRef(false);

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
                    behavior: prefersReducedMotion ? 'auto' : 'smooth',
                });
            },
            [getScrollAmount, slidesPerScroll, prefersReducedMotion],
        );

        const scrollToPage = useCallback(
            (index: number) => {
                const safePageCount = Math.max(1, pageCount);

                let targetIndex = index;

                if (loop) {
                    targetIndex = ((index % safePageCount) + safePageCount) % safePageCount;
                } else {
                    targetIndex = Math.max(0, Math.min(index, safePageCount - 1));
                }

                scrollTo(targetIndex);
            },
            [loop, pageCount, scrollTo],
        );

        const scrollNextPage = useCallback(() => {
            scrollToPage(activeIndex + 1);
        }, [activeIndex, scrollToPage]);

        const scrollPrevPage = useCallback(() => {
            scrollToPage(activeIndex - 1);
        }, [activeIndex, scrollToPage]);

        const autoplayNext = useCallback(() => {
            if ((pauseOnHover && hoveredRef.current) || (pauseOnFocus && focusedRef.current)) {
                return;
            }

            scrollNextPage();
        }, [pauseOnHover, pauseOnFocus, scrollNextPage]);

        React.useEffect(() => {
            if (!autoplay) return;

            autoplayRef.current = window.setInterval(() => {
                autoplayNext();
            }, autoplayDelay);

            return () => {
                if (autoplayRef.current) {
                    clearInterval(autoplayRef.current);
                }
            };
        }, [autoplay, autoplayDelay, autoplayNext]);

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

            setCanScrollPrev(loop || el.scrollLeft > 0);

            setCanScrollNext(loop || el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        }, [getScrollAmount, slidesPerScroll, pageCount, loop]);

        const scrollPrev = useCallback(() => {
            scrollPrevPage();
        }, [scrollPrevPage]);

        const scrollNext = useCallback(() => {
            scrollNextPage();
        }, [scrollNextPage]);

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

                draggable,

                prefersReducedMotion,

                dragThreshold,

                loop,
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

                draggable,

                prefersReducedMotion,

                dragThreshold,

                loop,
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
                    onMouseEnter={() => {
                        hoveredRef.current = true;
                    }}
                    onMouseLeave={() => {
                        hoveredRef.current = false;
                    }}
                    onFocusCapture={() => {
                        focusedRef.current = true;
                    }}
                    onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                            focusedRef.current = false;
                        }
                    }}
                    {...rest}
                >
                    {children}

                    <Box
                        position="absolute"
                        width="1px"
                        height="1px"
                        overflow="hidden"
                        clipPath="inset(50%)"
                        whiteSpace="nowrap"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        Page {activeIndex + 1} of {pageCount}
                    </Box>

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
        const {
            trackRef,

            gap,

            scrollPrev,
            scrollNext,

            scrollTo,

            pageCount,

            draggable,

            prefersReducedMotion,

            dragThreshold,
        } = useCarouselContext();

        const dragStartedRef = useRef(false);

        const isDraggingRef = useRef(false);

        const draggedRef = useRef(false);

        const startXRef = useRef(0);

        const scrollLeftRef = useRef(0);

        const velocityRef = useRef(0);

        const lastXRef = useRef(0);

        const lastTimeRef = useRef(0);

        const momentumRef = useRef<number | null>(null);

        const stopMomentum = useCallback(() => {
            if (momentumRef.current) {
                cancelAnimationFrame(momentumRef.current);

                momentumRef.current = null;
            }
        }, []);

        const startDrag = useCallback(
            (clientX: number) => {
                const el = trackRef.current;

                if (!draggable) return;

                if (!el) return;

                stopMomentum();

                dragStartedRef.current = false;

                draggedRef.current = false;

                isDraggingRef.current = true;

                startXRef.current = clientX;

                scrollLeftRef.current = el.scrollLeft;

                lastXRef.current = clientX;

                lastTimeRef.current = performance.now();

                velocityRef.current = 0;

                el.style.scrollBehavior = 'auto';

                el.style.scrollSnapType = 'none';

                document.body.style.userSelect = 'none';

                document.body.style.webkitUserSelect = 'none';

                document.body.style.cursor = 'grabbing';
            },
            [trackRef, draggable, stopMomentum],
        );

        const moveDrag = useCallback(
            (clientX: number) => {
                const el = trackRef.current;

                if (!el || !isDraggingRef.current) return;

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

                el.scrollLeft = scrollLeftRef.current - delta;

                const now = performance.now();

                const dx = clientX - lastXRef.current;

                const dt = now - lastTimeRef.current;

                if (dt > 0) {
                    velocityRef.current = dx / dt;
                }

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

            document.body.style.webkitUserSelect = '';

            document.body.style.cursor = '';

            if (prefersReducedMotion) {
                el.style.scrollSnapType = 'x mandatory';

                el.style.scrollBehavior = 'auto';

                return;
            }

            const momentum = () => {
                velocityRef.current *= 0.95;

                if (Math.abs(velocityRef.current) < 0.02) {
                    el.style.scrollSnapType = 'x mandatory';

                    el.style.scrollBehavior = 'smooth';

                    return;
                }

                el.scrollLeft -= velocityRef.current * 20;

                momentumRef.current = requestAnimationFrame(momentum);
            };

            momentum();
        }, [trackRef, prefersReducedMotion]);

        const handlePointerMove = useCallback(
            (event: PointerEvent) => {
                moveDrag(event.clientX);
            },
            [moveDrag],
        );

        const handlePointerUp = useCallback(() => {
            window.removeEventListener('pointermove', handlePointerMove);

            window.removeEventListener('pointerup', handlePointerUp);

            endDrag();
        }, [endDrag, handlePointerMove]);

        React.useEffect(() => {
            return () => {
                stopMomentum();

                window.removeEventListener('pointermove', handlePointerMove);

                window.removeEventListener('pointerup', handlePointerUp);
            };
        }, [handlePointerMove, handlePointerUp, stopMomentum]);

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
            [scrollPrev, scrollNext, scrollTo, pageCount],
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
                overscrollBehaviorX="contain"
                scrollSnapType="x mandatory"
                touchAction={draggable ? 'pan-y' : undefined}
                gap={gap}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={
                    draggable
                        ? (e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);

                              startDrag(e.clientX);

                              window.addEventListener('pointermove', handlePointerMove);

                              window.addEventListener('pointerup', handlePointerUp);
                          }
                        : undefined
                }
                onClickCapture={(e) => {
                    if (draggedRef.current) {
                        e.preventDefault();

                        e.stopPropagation();
                    }
                }}
                data-dragging={draggable && isDraggingRef.current ? true : undefined}
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
        const { activeIndex, pageCount, scrollTo, loop } = useCarouselContext();

        const indicatorRefs = useRef<Array<HTMLButtonElement | null>>([]);

        const handleKeyDown = useCallback(
            (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
                let nextIndex = index;

                switch (event.key) {
                    case 'ArrowRight': {
                        if (loop) {
                            nextIndex = (index + 1) % pageCount;
                        } else {
                            nextIndex = Math.min(index + 1, pageCount - 1);
                        }

                        break;
                    }

                    case 'ArrowLeft': {
                        if (loop) {
                            nextIndex = (index - 1 + pageCount) % pageCount;
                        } else {
                            nextIndex = Math.max(index - 1, 0);
                        }

                        break;
                    }

                    case 'Home': {
                        nextIndex = 0;

                        break;
                    }

                    case 'End': {
                        nextIndex = pageCount - 1;

                        break;
                    }

                    default: {
                        return;
                    }
                }

                event.preventDefault();

                scrollTo(nextIndex);

                indicatorRefs.current[nextIndex]?.focus();
            },
            [loop, pageCount, scrollTo],
        );

        return (
            <Box
                ref={ref}
                className={clsx(prefix('__indicators'), className)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
                role="tablist"
                {...rest}
            >
                {Array.from({ length: pageCount }).map((_, index) => {
                    const active = index === activeIndex;

                    return (
                        <Box
                            key={index}
                            ref={(node: HTMLButtonElement | null) => {
                                indicatorRefs.current[index] = node;
                            }}
                            as="button"
                            type="button"
                            role="tab"
                            tabIndex={active ? 0 : -1}
                            aria-selected={active}
                            className={clsx(
                                prefix('__indicator'),
                                active && prefix('__indicator-active'),
                            )}
                            aria-label={`Go to page ${index + 1}`}
                            aria-current={active}
                            onClick={() => scrollTo(index)}
                            onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
                                handleKeyDown(event, index);
                            }}
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
    const frameRef = useRef<number | null>(null);

    const { trackRef, updatePageCount } = useCarouselContext();

    const handleResize = useCallback(() => {
        updatePageCount();

        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        frameRef.current = requestAnimationFrame(() => {
            onScroll();
        });
    }, [updatePageCount, onScroll]);

    React.useEffect(() => {
        const el = trackRef.current;

        if (!el) return;

        handleResize();

        el.addEventListener('scroll', onScroll, {
            passive: true,
        });

        const observer = new ResizeObserver(() => {
            handleResize();
        });

        observer.observe(el);

        return () => {
            el.removeEventListener('scroll', onScroll);

            observer.disconnect();

            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
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
