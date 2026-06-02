import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { cardPrefix as classPrefix } from './Card';
import { Box } from '../Box';
import type { BoxProps, BoxComponentProps } from '../Box';
import { Density, densitySpacings, SectionType } from './card.tokens';
import { useCardContext } from './card.context';
import { hasKey } from '../../utils/ts';
import { createPolymorphic } from '../../types/polymorphic';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type OwnSectionProps = {
    density?: Density;
    type?: SectionType;
};

type SectionProps = OwnSectionProps & BoxProps;

type ImplSectionProps<C extends React.ElementType = 'div'> = BoxComponentProps<C, OwnSectionProps>;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (sectionType: SectionType, name: string = '') => {
    return classPrefix(`__${sectionType}${name}`);
};

const resolveSpacings = (density: Density, type: SectionType) => {
    if (!hasKey(densitySpacings, density)) return undefined;
    return densitySpacings[density][type as SectionType];
};

// -----------------------------------------------------------------------------
// Section Implementation
// -----------------------------------------------------------------------------

const SectionImpl = (
    { className, children, px, py, density, type = 'section', ...rest }: ImplSectionProps,
    ref: React.Ref<any>,
) => {
    const { density: ctxDensity } = useCardContext();

    const finalDensity = density ?? ctxDensity;

    const resolvedSpacings = resolveSpacings(finalDensity, type);

    return (
        <Box
            ref={ref}
            px={px ?? resolvedSpacings?.px}
            py={py ?? resolvedSpacings?.py}
            className={clsx(className, prefix(type))}
            {...rest}
        >
            {children}
        </Box>
    );
};

// -----------------------------------------------------------------------------
// Section Polymorphic
// -----------------------------------------------------------------------------

export const Section = createPolymorphic<SectionProps, 'div'>(
    forwardRef(SectionImpl),
    'Card.Section',
);

export type { OwnSectionProps, SectionProps, ImplSectionProps };
