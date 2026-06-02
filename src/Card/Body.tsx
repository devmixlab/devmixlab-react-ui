import React, { forwardRef } from 'react';
import { Section } from './Section';
import type { SectionProps, ImplSectionProps } from './Section';
import { createPolymorphic } from '../types/polymorphic';
import { useCardContext } from './card.context';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type BodyProps = Omit<SectionProps, 'type'>;
type ImplBodyProps = Omit<ImplSectionProps, 'type'>;

// -----------------------------------------------------------------------------
// Body Implementation
// -----------------------------------------------------------------------------

export const BodyImpl = (
    { direction = 'row', gap, ...rest }: ImplBodyProps,
    ref: React.Ref<any>,
) => {
    const { density } = useCardContext();
    const finalGap = gap ?? density ?? undefined;

    return (
        <Section direction={direction} ref={ref} gap={finalGap} {...rest} type="body" d="flex" />
    );
};

// -----------------------------------------------------------------------------
// Body Polymorphic
// -----------------------------------------------------------------------------

export const Body = createPolymorphic<BodyProps, 'div'>(forwardRef(BodyImpl), 'Card.Body');

export type { BodyProps, ImplBodyProps };
