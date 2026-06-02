import React, { forwardRef } from 'react';
import { CardProvider } from './card.context';
import { Density, Intent, Variant } from './card.tokens';
import { Box } from '../Box';
import type { BoxProps, BoxComponentProps } from '../Box';
import clsx from 'clsx';
import { createPolymorphic, type PolymorphicComponent } from '../../types/polymorphic';
import type { HeaderProps } from './Header';
import type { BodyProps } from './Body';
import type { MediaComponent } from './media/Media';
import type { FooterProps } from './Footer';
import type { ContentProps } from './Content';
import type { SectionProps } from './Section';
import { classPrefix } from '../../utils/classPrefix';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type OwnCardProps = {
    density?: Density;
    accent?: boolean;
    accentSide?: 'left' | 'top';

    interactive?: boolean;
    hoverable?: boolean;
    pressable?: boolean;
    focusable?: boolean;

    active?: boolean;
    disabled?: boolean;
    intent?: Intent;
    variant?: Variant;

    focused?: boolean;
};

type CardProps = OwnCardProps & BoxProps;

type ImplCardProps<C extends React.ElementType = 'div'> = BoxComponentProps<C, OwnCardProps>;

type CardComponent = PolymorphicComponent<CardProps, 'div'> & {
    Header: PolymorphicComponent<HeaderProps>;
    Body: PolymorphicComponent<BodyProps>;
    Footer: PolymorphicComponent<FooterProps>;
    Media: MediaComponent;
    Content: PolymorphicComponent<ContentProps>;
    Section: PolymorphicComponent<SectionProps>;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

export const cardPrefix = (name: string = '') => {
    return classPrefix(`--card${name}`);
};

// -----------------------------------------------------------------------------
// Card Implementation
// -----------------------------------------------------------------------------

export const CardImpl = <C extends React.ElementType = 'div'>(
    {
        className,
        as,
        density = 'md',

        interactive = false,
        hoverable,
        pressable,
        focusable,

        active = false,
        disabled = false,
        accent = false,
        accentSide = 'left',
        intent = 'secondary',
        variant = 'base',

        focused,

        d = 'flex',
        direction = 'column',
        ...rest
    }: ImplCardProps<C>,
    ref: React.Ref<any>,
) => {
    const { onClick, onKeyDown, href, role, tabIndex, type, ...restProps } = rest as any;

    const isNaturallyInteractive = (as === 'a' && href != null) || as === 'button';
    const isDisabled = disabled;

    const finalInteractive = !isDisabled && (isNaturallyInteractive || interactive);
    const finalHoverable = hoverable ?? finalInteractive;
    const finalPressable = pressable ?? finalInteractive;
    const finalFocusable = focusable ?? finalInteractive;

    const isButtonLike = finalInteractive && !isNaturallyInteractive;

    return (
        <CardProvider value={{ density, interactive: finalInteractive, disabled: isDisabled }}>
            <Box
                ref={ref}
                as={as}
                className={clsx(cardPrefix(), className)}
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
                data-hoverable={finalHoverable || undefined}
                data-pressable={finalPressable || undefined}
                data-focusable={finalFocusable || undefined}
                data-active={active || undefined}
                data-disabled={isDisabled || undefined}
                data-accent={accent ? accentSide : undefined}
                data-variant={variant}
                data-intent={intent}
                data-density={density}
                data-focused={focused || undefined}
                {...restProps}
                d={d}
                direction={direction}
            />
        </CardProvider>
    );
};

// -----------------------------------------------------------------------------
// Card Polymorphic
// -----------------------------------------------------------------------------

export const Card = createPolymorphic<CardProps, 'div'>(forwardRef(CardImpl), 'Card');

export type { OwnCardProps, CardProps, ImplCardProps, CardComponent };
