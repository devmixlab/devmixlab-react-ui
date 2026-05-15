import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from '.././Card';
import { Box, type BoxProps } from '../../Box/Box';
import { createPolymorphic } from '../../types/polymorphic';

export type ImageProps = {
    src: string;
    alt?: string;
    className?: string;
} & Omit<BoxProps, 'children'>;

const prefix = (name: string = '') => {
    return classPrefix(`__image${name}`);
};

export const ImageImpl = (
    { className, src, alt = '', objFit = 'cover', ...rest }: ImageProps,
    ref: React.Ref<any>,
) => {
    const cl = clsx(prefix(), className);

    return <Box {...rest} objFit={objFit} as="img" ref={ref} src={src} alt={alt} className={cl} />;
};

export const Image = createPolymorphic<ImageProps, 'img'>(forwardRef(ImageImpl), 'Card.Image');
