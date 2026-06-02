import React, { forwardRef } from 'react';
import { Section } from './Section';
import type { SectionProps, ImplSectionProps } from './Section';
import { createPolymorphic } from '../types/polymorphic';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type FooterProps = Omit<SectionProps, 'type'>;
type ImplFooterProps = Omit<ImplSectionProps, 'type'>;

// -----------------------------------------------------------------------------
// Footer Implementation
// -----------------------------------------------------------------------------

export const FooterImpl = (props: ImplFooterProps, ref: React.Ref<any>) => {
    return <Section ref={ref} {...props} type="footer" />;
};

// -----------------------------------------------------------------------------
// Footer Polymorphic
// -----------------------------------------------------------------------------

export const Footer = createPolymorphic<FooterProps, 'div'>(forwardRef(FooterImpl), 'Card.Footer');

export type { FooterProps, ImplFooterProps };
