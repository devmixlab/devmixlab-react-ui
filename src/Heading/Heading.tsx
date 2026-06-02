import React, { forwardRef } from 'react';
import { CLASS_PREFIX } from '../constants';

import { Box, type BoxProps } from '../Components/Box/Box';
import clsx from 'clsx';

import { createPolymorphic, type PolymorphicComponent } from '../types/polymorphic';

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--heading${name}`;
};

export const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

export type HeadingLevel = (typeof headingLevels)[number];

const isHeading = (value: unknown): value is HeadingLevel =>
    typeof value === 'string' && headingLevels.includes(value as HeadingLevel);

export type HeadingsProps = {
    as?: React.ElementType;
    h?: HeadingLevel;
    // children?: React.ReactNode;
    className?: string;
} & BoxProps;

export type HProps = Omit<HeadingsProps, 'h'>;

export type HeadingComponent = PolymorphicComponent<HeadingsProps, 'h4'> & {
    H1: PolymorphicComponent<HProps>;
    H2: PolymorphicComponent<HProps>;
    H3: PolymorphicComponent<HProps>;
    H4: PolymorphicComponent<HProps>;
    H5: PolymorphicComponent<HProps>;
    H6: PolymorphicComponent<HProps>;
};

const HeadingImpl = ({ className, as = 'h4', h, ...rest }: HeadingsProps, ref: React.Ref<any>) => {
    const normalizedAs = typeof as === 'string' ? as.toLowerCase() : as;

    const level = h ?? (isHeading(normalizedAs) ? normalizedAs : 'h4');

    return (
        <Box
            ref={ref}
            as={as}
            className={clsx(prefix(), prefix(`--${level}`), className)}
            {...rest}
        />
    );
};

export const Heading = createPolymorphic<HeadingsProps, 'h4'>(forwardRef(HeadingImpl), 'Heading');
