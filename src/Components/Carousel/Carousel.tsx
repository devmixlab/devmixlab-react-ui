// -----------------------------------------------------------------------------
// Carousel.tsx
// V3 — refactored with useCarouselDrag / useCarouselAutoplay /
//       useCarouselKeyboard / useCarouselVisibility
// -----------------------------------------------------------------------------

import React, {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useImperativeHandle,
    HTMLAttributes,
} from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box';
import { classPrefix } from '../../utils/classPrefix';

import { useCarouselDrag, UseCarouselDragReturn } from './useCarouselDrag';
import { useCarouselAutoplay } from './useCarouselAutoplay';
import { useCarouselKeyboard } from './useCarouselKeyboard';
import { useCarouselVisibility } from './useCarouselVisibility';
import { useCarouselControl, CarouselControlRenderElementProps } from './useCarouselControl';
import { CarouselContextValue, CarouselContext, useCarouselContext } from './Carousel.context';
import { ChevronLeft } from '../Icon';
import { Button, ButtonProps } from '../Button';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--carousel${name}`);

const controlDefaultProps: ButtonProps = {
    rounded: 'full',
    intent: 'secondary',
    type: 'button',
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type CarouselHandle = {
    sync: () => void;
};

type OwnCarouselProps = {
    activeIndex?: number;
    defaultActiveIndex?: number;
    onActiveIndexChange?: (index: number) => void;

    overscroll?: boolean;

    gap?: number;

    controlProps?: ButtonProps;

    slidesPerView?: number;
    slidesPerScroll?: number;

    autoplay?: boolean;
    autoplayDelay?: number;
    autoplaySpeed?: number;
    goToSpeed?: number;
    pauseOnHover?: boolean;
    pauseOnFocus?: boolean;

    draggable?: boolean;

    disableMotion?: boolean;

    dragThreshold?: number;
    minMomentumVelocity?: number;

    loop?: boolean;

    onPageChange?: (index: number) => void;
    onVisibilityChange?: (visibleIndexes: number[]) => void;
    onSlideVisible?: (index: number) => void;
    onSlideHidden?: (index: number) => void;
    onReachStart?: () => void;
    onReachEnd?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onAutoplayStart?: () => void;
    onAutoplayStop?: () => void;
};

type CarouselProps = BoxComponentProps<'div', OwnCarouselProps>;

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

const CarouselRoot = forwardRef<CarouselHandle, CarouselProps>(
    (
        {
            children,
            className,

            activeIndex: controlledIndex,
            defaultActiveIndex = 0,
            onActiveIndexChange,

            overscroll = true,

            gap = 4,

            controlProps,

            slidesPerView = 1,
            slidesPerScroll = 1,

            autoplay = false,
            autoplayDelay = 3000,
            autoplaySpeed = 600,
            goToSpeed = 450,

            pauseOnHover = true,
            pauseOnFocus = true,

            draggable = true,

            disableMotion = false,

            dragThreshold = 6,
            minMomentumVelocity = 2,

            loop = false,

            onPageChange,
            onVisibilityChange,
            onSlideVisible,
            onSlideHidden,
            onReachStart,
            onReachEnd,
            onDragStart,
            onDragEnd,
            onAutoplayStart,
            onAutoplayStop,

            ...rest
        },
        ref,
    ) => {
        // ── Motion preference ────────────────────────────────────────────────
        const [reducedMotion, setReducedMotion] = useState(() =>
            typeof window !== 'undefined'
                ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
                : false,
        );

        useEffect(() => {
            const media = window.matchMedia('(prefers-reduced-motion: reduce)');
            const update = () => setReducedMotion(media.matches);
            update();
            media.addEventListener('change', update);
            return () => media.removeEventListener('change', update);
        }, []);

        const prefersReducedMotion = reducedMotion || disableMotion;

        // ── Core refs / state ────────────────────────────────────────────────
        const trackRef = useRef<HTMLDivElement>(null);
        const animationFrameRef = useRef<number | null>(null);
        const previousPageRef = useRef(0);
        const reachedStartRef = useRef(false);
        const reachedEndRef = useRef(false);
        const scrollStopTimeoutRef = useRef<number | null>(null);

        // ── useCarouselDrag ──────────────────────────────────────────────────
        const carouselDrag = useCarouselDrag({
            trackRef,
            draggable,
            dragThreshold,
            minMomentumVelocity,
            prefersReducedMotion,
            onDragStart,
            onDragEnd,
            overscroll,
        });

        const isControlled = controlledIndex !== undefined;

        const activeIndexRef = useRef(controlledIndex ?? defaultActiveIndex);
        const emittedIndexRef = useRef(controlledIndex ?? defaultActiveIndex);
        const syncingControlledScrollRef = useRef(false);

        const [activeIndex, setActiveIndex] = useState(controlledIndex ?? defaultActiveIndex);
        const [pageCount, setPageCount] = useState(0);
        const [canScrollPrev, setCanScrollPrev] = useState(false);
        const [canScrollNext, setCanScrollNext] = useState(true);

        // Runs only on mount once
        useEffect(() => {
            const index = controlledIndex ?? defaultActiveIndex;
            scrollTo(index, 0);
        }, []);

        // clear timeout on unmount
        useEffect(() => {
            return () => {
                if (scrollStopTimeoutRef.current != null) {
                    clearTimeout(scrollStopTimeoutRef.current);
                }
            };
        }, []);

        // sync controlled mode controlledIndex with carousel
        useEffect(() => {
            if (!isControlled) return;
            scrollTo(controlledIndex);
        }, [controlledIndex, isControlled]);

        // clear animation on unmount
        useEffect(() => {
            return () => {
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            };
        }, []);

        useEffect(() => {
            activeIndexRef.current = activeIndex;
        }, [activeIndex]);

        // ── Page geometry ────────────────────────────────────────────────────
        const getPageCount = useCallback(() => {
            const el = trackRef.current;
            if (!el) return 0;
            const maxIndex = Math.max(0, el.children.length - slidesPerView);
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

        const stopAnimation = useCallback(() => {
            const el = trackRef.current;

            syncingControlledScrollRef.current = false;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            if (el) {
                el.style.scrollSnapType = 'x mandatory';
            }
        }, []);

        // ── Imperative scroll ────────────────────────────────────────────────
        const scrollTo = useCallback(
            (index: number, speed = goToSpeed) => {
                const el = trackRef.current;
                if (!el) return;

                carouselDrag.stopMomentum();

                syncingControlledScrollRef.current = true;

                const maxScrollLeft = el.scrollWidth - el.clientWidth;
                const target = getScrollAmount() * slidesPerScroll * index;
                const finalTarget = Math.min(target, maxScrollLeft);

                if (prefersReducedMotion || speed <= 0) {
                    el.scrollTo({ left: finalTarget, behavior: 'auto' });

                    requestAnimationFrame(() => {
                        syncingControlledScrollRef.current = false;
                    });

                    return;
                }

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                    el.style.scrollSnapType = 'x mandatory';
                }

                const previousSnap = el.style.scrollSnapType;
                el.style.scrollSnapType = 'none';

                const start = el.scrollLeft;
                const change = finalTarget - start;
                const startTime = performance.now();

                const animate = (time: number) => {
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / speed, 1);
                    const eased =
                        progress < 0.5
                            ? 2 * progress * progress
                            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                    el.scrollLeft = start + change * eased;

                    if (progress < 1) {
                        animationFrameRef.current = requestAnimationFrame(animate);
                    } else {
                        animationFrameRef.current = null;

                        syncingControlledScrollRef.current = false;

                        el.style.scrollSnapType = previousSnap || 'x mandatory';
                    }
                };

                animationFrameRef.current = requestAnimationFrame(animate);
            },
            [getScrollAmount, slidesPerScroll, prefersReducedMotion, goToSpeed, carouselDrag],
        );

        // const sync = useCallback(() => {
        //     if (!isControlled) return;
        //
        //     carouselDrag.stopMomentum();
        //
        //     scrollTo(controlledIndex);
        // }, [isControlled, carouselDrag, scrollTo, controlledIndex]);

        const sync = useCallback(() => {
            if (!isControlled) return;

            const el = trackRef.current;
            if (!el) return;

            const scrollPerPage = getScrollAmount() * slidesPerScroll;

            const currentVisualIndex =
                scrollPerPage === 0
                    ? 0
                    : Math.min(
                          Math.max(0, Math.round(el.scrollLeft / scrollPerPage)),
                          Math.max(pageCount - 1, 0),
                      );

            // already visually synced
            if (currentVisualIndex === controlledIndex) {
                return;
            }

            carouselDrag.stopMomentum();

            scrollTo(controlledIndex);
        }, [
            isControlled,
            controlledIndex,
            carouselDrag,
            scrollTo,
            trackRef,
            getScrollAmount,
            slidesPerScroll,
            pageCount,
        ]);

        const scrollToPage = useCallback(
            (index: number, speed = goToSpeed) => {
                const safePageCount = Math.max(1, pageCount);
                const targetIndex = loop
                    ? ((index % safePageCount) + safePageCount) % safePageCount
                    : Math.max(0, Math.min(index, safePageCount - 1));
                scrollTo(targetIndex, speed);
            },
            [loop, pageCount, scrollTo, goToSpeed],
        );

        const scrollPrev = useCallback(
            () => scrollToPage(activeIndex - 1),
            [activeIndex, scrollToPage],
        );
        const scrollNext = useCallback(
            () => scrollToPage(activeIndex + 1),
            [activeIndex, scrollToPage],
        );

        // ── useCarouselVisibility ────────────────────────────────────────────
        const { updateVisibility } = useCarouselVisibility({
            trackRef,
            onVisibilityChange,
            onSlideVisible,
            onSlideHidden,
        });

        // ── Scroll state sync ────────────────────────────────────────────────
        const updateScrollState = useCallback(() => {
            const el = trackRef.current;
            if (!el) return;

            if (scrollStopTimeoutRef.current != null) {
                clearTimeout(scrollStopTimeoutRef.current);
            }

            scrollStopTimeoutRef.current = setTimeout(() => {
                if (carouselDrag.isPointerDownRef.current || carouselDrag.isMomentumRef.current) {
                    return;
                }

                syncingControlledScrollRef.current = false;

                if (isControlled && emittedIndexRef.current !== activeIndexRef.current) {
                    emittedIndexRef.current = activeIndexRef.current;

                    onActiveIndexChange?.(activeIndexRef.current);
                }
            }, 100);

            const scrollPerPage = getScrollAmount() * slidesPerScroll;
            const safePageCount = Math.max(1, pageCount);
            let currentIndex = activeIndexRef.current;

            if (!carouselDrag.isOverscrollingRef.current) {
                currentIndex =
                    scrollPerPage === 0
                        ? 0
                        : Math.min(
                              safePageCount - 1,
                              Math.max(0, Math.round(el.scrollLeft / scrollPerPage)),
                          );
            }

            if (activeIndexRef.current !== currentIndex) {
                setActiveIndex(currentIndex);
            }

            if (previousPageRef.current !== currentIndex) {
                previousPageRef.current = currentIndex;
                onPageChange?.(currentIndex);
            }

            const atStart = el.scrollLeft <= 1;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

            setCanScrollPrev(loop || !atStart);
            setCanScrollNext(loop || !atEnd);

            if (atStart && !reachedStartRef.current) {
                reachedStartRef.current = true;
                onReachStart?.();
            }
            if (!atStart) reachedStartRef.current = false;

            if (atEnd && !reachedEndRef.current) {
                reachedEndRef.current = true;
                onReachEnd?.();
            }
            if (!atEnd) reachedEndRef.current = false;

            updateVisibility();
        }, [
            getScrollAmount,
            slidesPerScroll,
            pageCount,
            loop,
            onPageChange,
            onReachStart,
            onReachEnd,
            updateVisibility,
            carouselDrag,
            isControlled,
            onActiveIndexChange,
        ]);

        // ── useCarouselAutoplay ──────────────────────────────────────────────
        const { hoveredRef, focusedRef } = useCarouselAutoplay({
            autoplay,
            activeIndex,
            pageCount,
            autoplayDelay,
            autoplaySpeed,
            pauseOnHover,
            pauseOnFocus,
            loop,
            scrollToPage,
            onAutoplayStart,
            onAutoplayStop,
        });

        // ── Context value ────────────────────────────────────────────────────
        const value = useMemo<CarouselContextValue>(
            () => ({
                carouselDrag,
                stopAnimation,
                trackRef,
                activeIndexRef,
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
                slidesPerView,
                slidesPerScroll,
                gap,
                controlProps,
                activeIndex,
                pageCount,
                scrollTo,
                updatePageCount,
                draggable,
                prefersReducedMotion,
                dragThreshold,
                dragVelocity: minMomentumVelocity,
                loop,
                onDragStart,
                onDragEnd,
            }),
            [
                trackRef,
                activeIndexRef,
                carouselDrag,
                stopAnimation,
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
                slidesPerView,
                slidesPerScroll,
                gap,
                controlProps,
                activeIndex,
                pageCount,
                scrollTo,
                updatePageCount,
                draggable,
                prefersReducedMotion,
                dragThreshold,
                minMomentumVelocity,
                loop,
                onDragStart,
                onDragEnd,
            ],
        );

        useImperativeHandle(
            ref,
            () => ({
                sync,
            }),
            [sync],
        );

        return (
            <CarouselContext.Provider value={value}>
                <Box
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

                    {/* Accessible live region */}
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
            scrollTo,
            pageCount,
            draggable,
            prefersReducedMotion,
            dragThreshold,
            activeIndex,
            loop,
            onDragStart,
            onDragEnd,
            carouselDrag,
            stopAnimation,
        } = useCarouselContext();

        // ── useCarouselDrag ──────────────────────────────────────────────────
        const { startDrag, moveDrag, endDrag, draggedRef, stopMomentum } = carouselDrag;

        const handlePointerMove = useCallback(
            (event: PointerEvent) => moveDrag(event.clientX),
            [moveDrag],
        );

        const handlePointerUp = useCallback(() => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            endDrag();
        }, [endDrag, handlePointerMove]);

        useEffect(() => {
            return () => {
                stopMomentum();
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('pointerup', handlePointerUp);
            };
        }, [handlePointerMove, handlePointerUp, stopMomentum]);

        // ── useCarouselKeyboard ──────────────────────────────────────────────
        const { handleKeyDown } = useCarouselKeyboard({
            activeIndex,
            pageCount,
            loop,
            scrollTo,
        });

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
                              stopAnimation();

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
                aria-label="Carousel track"
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
// Prev & Next controls
// -----------------------------------------------------------------------------

type CarouselControlRenderProps = {
    ref: React.Ref<HTMLButtonElement>;
    elementProps: CarouselControlRenderElementProps;
    className: string;
};

type CarouselControlProps = {
    render?: (props: CarouselControlRenderProps) => React.ReactElement | null;
} & ButtonProps;

const CarouselPrev = forwardRef<HTMLButtonElement, CarouselControlProps>(
    ({ className, children = 'Prev', onClick, onKeyDown, render, ...rest }, ref) => {
        const { controlProps } = useCarouselContext();

        const controlClassName = clsx(prefix('__control'), className);

        const elementProps = useCarouselControl({
            direction: 'prev',
            onClick,
            onKeyDown,
        });

        if (render) {
            return render({
                ref,
                elementProps,
                className: controlClassName,
            });
        }

        const mergedProps = {
            ...controlDefaultProps,
            ...controlProps,
            ...rest,
            ...elementProps,
        };

        return (
            <Button ref={ref} className={controlClassName} {...mergedProps}>
                {children}
            </Button>
        );
    },
);

const CarouselNext = forwardRef<HTMLButtonElement, CarouselControlProps>(
    ({ className, children = 'Next', onClick, onKeyDown, render, ...rest }, ref) => {
        const { controlProps } = useCarouselContext();

        const controlClassName = clsx(prefix('__control'), className);

        const elementProps = useCarouselControl({
            direction: 'next',
            onClick,
            onKeyDown,
        });

        if (render) {
            return render({
                ref,
                elementProps,
                className: controlClassName,
            });
        }

        const mergedProps = {
            ...controlDefaultProps,
            ...controlProps,
            ...rest,
            ...elementProps,
        };

        return (
            <Button ref={ref} className={controlClassName} {...mergedProps}>
                {children}
            </Button>
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

        // Re-use keyboard hook per indicator via an inline adapter; each
        // button delegates to the shared scrollTo + indicator focus.
        const makeIndicatorKeyDown = useCallback(
            (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
                let nextIndex = index;

                switch (event.key) {
                    case 'ArrowRight':
                        nextIndex = loop
                            ? pageCount === 0
                                ? 0
                                : (index + 1) % pageCount
                            : Math.min(index + 1, pageCount - 1);
                        break;
                    case 'ArrowLeft':
                        nextIndex = loop
                            ? (index - 1 + pageCount) % pageCount
                            : Math.max(index - 1, 0);
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = pageCount - 1;
                        break;
                    default:
                        return;
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
                            aria-current={active}
                            aria-label={`Go to page ${index + 1}`}
                            className={clsx(
                                prefix('__indicator'),
                                active && prefix('__indicator-active'),
                            )}
                            onClick={() => scrollTo(index)}
                            onKeyDown={makeIndicatorKeyDown(index)}
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

        if (frameRef.current) cancelAnimationFrame(frameRef.current);

        frameRef.current = requestAnimationFrame(() => {
            onScroll();
        });
    }, [updatePageCount, onScroll]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        handleResize();

        el.addEventListener('scroll', onScroll, { passive: true });

        const observer = new ResizeObserver(handleResize);
        observer.observe(el);

        return () => {
            el.removeEventListener('scroll', onScroll);
            observer.disconnect();
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [trackRef, handleResize, onScroll]);

    return null;
};

// -----------------------------------------------------------------------------
// Compound export
// -----------------------------------------------------------------------------

const Carousel = CarouselRoot as CarouselCompound;

Carousel.Track = CarouselTrack;
Carousel.Item = CarouselItem;
Carousel.Prev = CarouselPrev;
Carousel.Next = CarouselNext;
Carousel.Indicators = CarouselIndicators;

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export { Carousel };

export type {
    CarouselHandle,
    OwnCarouselProps,
    CarouselProps,
    CarouselCompound,
    CarouselTrackProps,
    CarouselItemProps,
    CarouselControlRenderProps,
    CarouselControlProps,
    CarouselIndicatorsProps,
};
