import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from './Card';
import { Box, type BoxProps } from '../Components/Box/Box';
import { createPolymorphic } from '../types/polymorphic';

export type ContentProps = {
    children?: React.ReactNode;
    className?: string;
} & BoxProps;

const prefix = (name: string = '') => {
    return classPrefix(`__content${name}`);
};

export const ContentImpl = (
    { className, children, ...rest }: ContentProps,
    ref: React.Ref<any>,
) => {
    const cl = clsx(prefix(), className);

    return (
        <Box ref={ref} className={cl} {...rest}>
            {children}
        </Box>
    );
};

export const Content = createPolymorphic<ContentProps>(forwardRef(ContentImpl), 'Card.Content');
