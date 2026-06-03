import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from '../Card';
import { Box, type BoxProps } from '../../Box';
import { createPolymorphic } from '../../../types/polymorphic';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type HeroProps = {
    className?: string;
    size?: Size;
} & Omit<BoxProps, 'size'>;

const prefix = (name: string = '') => {
    return classPrefix(`__hero${name}`);
};

export const HeroImpl = (
    { className, size = 'md', rounded = 'inherit', ...rest }: HeroProps,
    ref: React.Ref<any>,
) => {
    return (
        <Box
            {...rest}
            rounded={rounded}
            ref={ref}
            className={clsx(prefix(), className)}
            data-size={size}
        />
    );
};

export const Hero = createPolymorphic<HeroProps>(forwardRef(HeroImpl), 'Card.Media.Hero');

export type { Size, HeroProps };
