import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box/Box';
import { createPolymorphic } from '../types/polymorphic';
import { CLASS_PREFIX } from '../constants';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// type SizeConfig = {
//     size: number;
//     fs: number;
// };

export type IconProps = {
    className?: string;
    size?: Size;
} & Omit<BoxProps, 'children' | 'size'>;

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--icon${name}`;
};

export const IconImpl = ({ className, size = 'md', ...rest }: IconProps, ref: React.Ref<any>) => {
    const cl = clsx(prefix(), prefix(`--${size}`), className);

    return <Box {...rest} className={cl} />;
};

export const Icon = createPolymorphic<IconProps>(forwardRef(IconImpl), 'Icon');
