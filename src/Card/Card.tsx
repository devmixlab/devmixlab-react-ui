import React, { forwardRef } from 'react';
import { CardProvider } from './card.context';
import { Density, Intent, Variant } from './card.tokens';
import { Box } from '../Components/Box';
import type { BoxProps, BoxComponentProps } from '../Components/Box';
import clsx from 'clsx';
import { createPolymorphic, type PolymorphicComponent } from '../types/polymorphic';
import { type HeaderOwnProps } from './Header';
import { type BodyOwnProps } from './Body';
import { type MediaComponent } from './media/Media';
import { type FooterOwnProps } from './Footer';
import { type ContentProps } from './Content';
import { type SectionOwnProps } from './Section';
import { classPrefix } from '../utils/classPrefix';

// it used in Body, Header, Footer
export const cardPrefix = (name: string = '') => {
    return classPrefix(`--card${name}`);
};

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

export type CardProps = OwnCardProps & BoxProps;

export type ImplCardProps<C extends React.ElementType = 'div'> = BoxComponentProps<C, OwnCardProps>;

export type CardComponent = PolymorphicComponent<CardProps, 'div'> & {
    Header: PolymorphicComponent<HeaderOwnProps>;
    Body: PolymorphicComponent<BodyOwnProps>;
    Footer: PolymorphicComponent<FooterOwnProps>;
    Media: MediaComponent;
    Content: PolymorphicComponent<ContentProps>;
    Section: PolymorphicComponent<SectionOwnProps>;
};

export const CardImpl = <C extends React.ElementType = 'div'>(
    {
        className,
        as,
        density = 'md',

        interactive = false,
        hoverable = false,
        pressable = false,
        focusable = false,

        active = false,
        disabled = false,
        accent = false,
        accentSide = 'left',
        intent,
        variant,

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

export const Card = createPolymorphic<CardProps, 'div'>(forwardRef(CardImpl), 'Card');
