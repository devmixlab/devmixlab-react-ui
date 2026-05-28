import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

import { Box, BoxComponentProps, Responsiveify } from '../Box/Box';

import { classPrefix } from '../utils/classPrefix';
import { Breakpoint, breakpoints, resolveResponsive, useBreakpoint } from '../utils/responsive';

const prefix = (name = '') => classPrefix(`--container${name}`);

export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// export type ContainerProps = BoxComponentProps<
//     'div',
//     {
//         /**
//          * Controls the maximum width
//          * of the container.
//          */
//         size?: ContainerSize;
//
//         /**
//          * Centers the container horizontally.
//          */
//         centered?: boolean;
//     }
// >;

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
            size: containerSize = 'lg',
            px = 'md',
            centered: containerCentered = true,
            style,
            ...rest
        },
        ref,
    ) => {
        const { breakpoint } = useBreakpoint();

        const size = resolveResponsive(containerSize, breakpoint);
        const centered = resolveResponsive(containerCentered, breakpoint);

        const maxWidth =
            size === 'full'
                ? undefined
                : `${breakpoints[containerSizeMap[size as Exclude<ContainerSize, 'full'>]]}px`;

        return (
            <Box
                ref={ref}
                w="full"
                px={px}
                className={clsx(prefix(), className)}
                style={{
                    maxWidth,
                    marginInline: centered ? 'auto' : undefined,
                    ...style,
                }}
                {...rest}
            />
        );
    },
);

Container.displayName = 'Container';
