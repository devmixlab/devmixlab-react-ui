import React, { createContext, useContext } from 'react';
import { UseCarouselDragReturn } from './useCarouselDrag';
import { CarouselControlSize, CarouselControlVariant } from './Carousel';

export type CarouselContextValue = {
    trackRef: React.MutableRefObject<HTMLDivElement | null>;
    activeIndexRef: React.MutableRefObject<number>;

    carouselDrag: UseCarouselDragReturn;
    stopAnimation: () => void;

    scrollPrev: () => void;
    scrollNext: () => void;

    canScrollPrev: boolean;
    canScrollNext: boolean;

    slidesPerView: number;
    slidesPerScroll: number;
    gap: number;

    controlVariant: CarouselControlVariant;
    controlSize: CarouselControlSize;

    activeIndex: number;
    pageCount: number;

    scrollTo: (index: number, speed?: number) => void;
    updatePageCount: () => void;

    draggable: boolean;
    prefersReducedMotion: boolean;
    dragThreshold: number;
    dragVelocity: number;

    loop: boolean;

    onDragStart?: () => void;
    onDragEnd?: () => void;
};

export const CarouselContext = createContext<CarouselContextValue | null>(null);

export const useCarouselContext = () => {
    const ctx = useContext(CarouselContext);

    if (!ctx) {
        throw new Error('Carousel components must be used inside <Carousel>');
    }

    return ctx;
};
