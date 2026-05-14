import React, { forwardRef } from 'react';
import { CLASS_PREFIX } from '../constants';
import { CardProvider } from './card.context';
import { Density } from './card.tokens';
import { Box, type BoxProps } from '../Box/Box';
import clsx from 'clsx';
import { createPolymorphic, type PolymorphicComponent } from '../types/polymorphic';
import { type HeaderOwnProps } from './Header';
import { type BodyOwnProps } from './Body';
import { type MediaComponent } from './media/Media';
import { type FooterOwnProps } from './Footer';
import { type ContentProps } from './Content';
import { type SectionOwnProps } from './Section';

// it used in Body, Header, Footer
export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--card${name}`;
};

type SpreadProps = {
    onClick?: React.MouseEventHandler;
    onKeyDown?: React.KeyboardEventHandler;
    href?: string;
    role?: string;
    tabIndex?: number;
    type?: 'button' | 'submit' | 'reset';
};

export type CardProps = {
    className?: string;
    as?: React.ElementType;
    density?: Density;
    accent?: boolean;
    accentSide?: 'left' | 'top';
    interactive?: boolean;
    disabled?: boolean;
    appearance?: 'neutral' | 'semantic';
} & BoxProps &
    SpreadProps;

export type CardComponent = PolymorphicComponent<CardProps, 'div'> & {
    Header: PolymorphicComponent<HeaderOwnProps>;
    Body: PolymorphicComponent<BodyOwnProps>;
    Footer: PolymorphicComponent<FooterOwnProps>;
    Media: MediaComponent;
    Content: PolymorphicComponent<ContentProps>;
    Section: PolymorphicComponent<SectionOwnProps>;
};

export const CardImpl = (
    {
        className,
        as = 'div',
        density = 'md',
        interactive = false,
        disabled = false,
        accent = false,
        accentSide = 'left',
        appearance = 'neutral',
        d = 'flex',
        direction = 'column',
        ...rest
    }: CardProps,
    ref: React.Ref<any>,
) => {
    const { onClick, onKeyDown, href, role, tabIndex, type, ...restProps } = rest;

    const isNaturallyInteractive = (as === 'a' && href != null) || as === 'button';
    const isDisabled = disabled;
    const finalInteractive = !isDisabled && (isNaturallyInteractive || interactive);
    const isButtonLike = finalInteractive && !isNaturallyInteractive;

    return (
        <CardProvider value={{ density, interactive: finalInteractive, disabled: isDisabled }}>
            <Box
                ref={ref}
                as={as}
                className={clsx(prefix(), className)}
                href={as === 'a' && isDisabled ? undefined : href}
                aria-disabled={isDisabled || undefined}
                tabIndex={isDisabled ? -1 : isButtonLike ? 0 : tabIndex}
                role={isButtonLike ? 'button' : role}
                type={as === 'button' ? (type ?? 'button') : undefined}
                onClick={
                    isDisabled
                        ? (e: React.MouseEvent) => {
                              e.preventDefault();
                              e.stopPropagation();
                          }
                        : onClick
                }
                onKeyDown={
                    isDisabled
                        ? (e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                              }
                              onKeyDown?.(e);
                          }
                        : isButtonLike
                          ? (e: React.KeyboardEvent) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onClick?.(e as any);
                                }
                                onKeyDown?.(e);
                            }
                          : onKeyDown
                }
                disabled={as === 'button' ? isDisabled : undefined}
                data-interactive={finalInteractive || undefined}
                data-disabled={isDisabled || undefined}
                data-accent={accent ? accentSide : undefined}
                data-appearance={appearance}
                data-density={density}
                {...restProps}
                d={d}
                direction={direction}
            />
        </CardProvider>
    );
};

export const Card = createPolymorphic<CardProps, 'div'>(forwardRef(CardImpl), 'Card');
