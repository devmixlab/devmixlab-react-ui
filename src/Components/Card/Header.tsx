import React, { forwardRef } from 'react';
import { Section } from './Section';
import type { SectionProps, ImplSectionProps } from './Section';
import { createPolymorphic } from '../../types/polymorphic';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type HeaderProps = Omit<SectionProps, 'type'>;
type ImplHeaderProps = Omit<ImplSectionProps, 'type'>;

// -----------------------------------------------------------------------------
// Header Implementation
// -----------------------------------------------------------------------------

export const HeaderImpl = (props: ImplHeaderProps, ref: React.Ref<any>) => {
    return <Section ref={ref} {...props} type="header" />;
};

// -----------------------------------------------------------------------------
// Header Polymorphic
// -----------------------------------------------------------------------------

export const Header = createPolymorphic<HeaderProps, 'div'>(forwardRef(HeaderImpl), 'Card.Header');

export type { HeaderProps, ImplHeaderProps };
