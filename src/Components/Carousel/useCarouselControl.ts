import { useCarouselContext } from './Carousel.context';
import { useCarouselKeyboard } from './useCarouselKeyboard';
import React from 'react';

type UseCarouselControlProps = {
    direction: 'prev' | 'next';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
};

type CarouselControlRenderElementProps = Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'children'
> & {
    'data-control-direction': 'prev' | 'next';
};

function useCarouselControl({
    direction,
    onClick,
    onKeyDown,
}: UseCarouselControlProps): CarouselControlRenderElementProps {
    const {
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        scrollTo,
        pageCount,
        activeIndex,
        loop,
        controlProps,
    } = useCarouselContext();

    const { handleKeyDown } = useCarouselKeyboard({
        activeIndex,
        pageCount,
        loop,
        scrollTo,
    });

    return {
        onClick: (e) => {
            controlProps?.onClick?.(e);
            onClick?.(e);

            if (!e.defaultPrevented) {
                direction === 'prev' ? scrollPrev() : scrollNext();
            }
        },

        onKeyDown: (e) => {
            controlProps?.onKeyDown?.(e);
            onKeyDown?.(e);

            if (!e.defaultPrevented) {
                handleKeyDown(e);
            }
        },

        disabled: direction === 'prev' ? !canScrollPrev : !canScrollNext,

        'aria-label': direction === 'prev' ? 'Previous slide' : 'Next slide',

        'data-control-direction': direction,
    };
}

export { useCarouselControl };

export type { UseCarouselControlProps, CarouselControlRenderElementProps };
