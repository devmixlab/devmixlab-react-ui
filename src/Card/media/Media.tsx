import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from '../Card';
import { Box, type BoxProps } from '../../Components/Box/Box';
import { createPolymorphic, type PolymorphicComponent } from '../../types/polymorphic';
import { type ImageProps } from './Image';
import { type IconProps } from './Icon';

export type MediaProps = {
    children?: React.ReactNode;
    className?: string;
} & BoxProps;

export type MediaComponent = PolymorphicComponent<MediaProps, 'div'> & {
    Image: PolymorphicComponent<ImageProps>;
    Icon: PolymorphicComponent<IconProps>;
};

const prefix = (name: string = '') => {
    return classPrefix(`__media${name}`);
};

export const MediaImpl = ({ className, children, ...rest }: MediaProps, ref: React.Ref<any>) => {
    const cl = clsx(prefix(), className);

    return (
        <Box ref={ref} className={cl} {...rest}>
            {children}
        </Box>
    );
};

export const Media = createPolymorphic<MediaProps>(forwardRef(MediaImpl), 'Card.Media');
