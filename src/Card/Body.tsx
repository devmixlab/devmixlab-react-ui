import React, { forwardRef } from 'react';
import { Section, type SectionOwnProps } from './Section';
import { createPolymorphic } from '../types/polymorphic';
import { BoxProps } from '../Components/Box/Box';
import { useCardContext } from './card.context';

export type BodyOwnProps = {
    direction?: BoxProps['direction'];
} & Omit<SectionOwnProps, 'type'>;

type BodyProps = BodyOwnProps;

export const BodyImpl = (
    { direction = 'row', gap, ...rest }: BodyOwnProps,
    ref: React.Ref<any>,
) => {
    const { density } = useCardContext();
    const finalGap = gap ?? density ?? undefined;

    return (
        <Section direction={direction} ref={ref} gap={finalGap} {...rest} type="body" d="flex" />
    );
};

export const Body = createPolymorphic<BodyProps, 'div'>(forwardRef(BodyImpl), 'Card.Body');
