import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from './Card';
import { Box } from '../Box';
import type { BoxProps, BoxComponentProps } from '../Box';
import { createPolymorphic } from '../../types/polymorphic';
import { OwnSectionProps } from './Section';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type OwnContentProps = {};

type ContentProps = OwnContentProps & BoxProps;

type ImplContentProps<C extends React.ElementType = 'div'> = BoxComponentProps<C, OwnContentProps>;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name: string = '') => {
    return classPrefix(`__content${name}`);
};

// -----------------------------------------------------------------------------
// Content Implementation
// -----------------------------------------------------------------------------

export const ContentImpl = (
    { className, children, ...rest }: ImplContentProps,
    ref: React.Ref<any>,
) => {
    return (
        <Box ref={ref} className={clsx(prefix(), className)} {...rest}>
            {children}
        </Box>
    );
};

// -----------------------------------------------------------------------------
// Content Polymorphic
// -----------------------------------------------------------------------------

export const Content = createPolymorphic<ContentProps>(forwardRef(ContentImpl), 'Card.Content');

export type { OwnContentProps, ContentProps, ImplContentProps };
