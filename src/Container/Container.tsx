import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';

import { classPrefix } from '../utils/classPrefix';

import {
    Breakpoint,
    breakpoints,
    resolveResponsive,
    useBreakpoint,
    Responsiveify,
} from '../utils/responsive';

import { useContainerContext } from './Container.context';

const prefix = (name = '') => classPrefix(`--container${name}`);

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

type ContainerOwnProps = Responsiveify<{
    /**
     * Controls the maximum width
     * of the container.
     */
    size?: ContainerSize;

    /**
     * Centers the container horizontally.
     */
    centered?: boolean;
}>;

export type ContainerProps = Omit<BoxComponentProps<'div'>, 'size'> & ContainerOwnProps;

const containerSizeMap: Record<Exclude<ContainerSize, 'full'>, Breakpoint> = {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
    (
        {
            className,

            size: containerSize,

            centered: containerCentered,

            px = 'md',

            ...rest
        },
        ref,
    ) => {
        const { breakpoint } = useBreakpoint();

        const context = useContainerContext();

        const resolvedSize = resolveResponsive(containerSize ?? context.size ?? 'lg', breakpoint);

        const resolvedCentered = resolveResponsive(
            containerCentered ?? context.centered ?? true,
            breakpoint,
        );

        const maxWidth =
            resolvedSize && resolvedSize !== 'full'
                ? `${breakpoints[containerSizeMap[resolvedSize]]}px`
                : undefined;

        return (
            <Box
                ref={ref}
                w="full"
                px={px}
                className={clsx(prefix(), className)}
                maxW={maxWidth}
                marginInline={resolvedCentered ? 'auto' : undefined}
                {...rest}
                data-size={resolvedSize}
                data-centered={resolvedCentered}
            />
        );
    },
);

Container.displayName = 'Container';
