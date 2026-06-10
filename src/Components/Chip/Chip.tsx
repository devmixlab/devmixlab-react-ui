import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps, BoxComponentProps, Props } from '../Box/Box';
// import { Size, Intent, Variant } from './chip.tokens';
// import { prefix } from './chip.helpers';
// import { CLASS_PREFIX } from '../../constants';
import { classPrefix } from '../../utils/classPrefix';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';

//---------------------------------------------------------------
// Types
//---------------------------------------------------------------

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof sizes)[number];

export type Variant = 'solid' | 'base' | 'outlined' | 'ghost';
export type Intent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type OwnChipProps = {
    // as?: React.ElementType;
    // className?: string;
    // children: React.ReactNode;
    intent?: Intent;
    variant?: Variant;
    size?: Size;

    number?: number; // to format value as tabular-nums

    disabled?: boolean;
    selected?: boolean; // selected / current (pagination, tabs)
    focused?: boolean;

    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    iconOnly?: boolean;

    removable?: boolean;
    onRemove?: () => void;

    // href?: string;
    // onClick?: React.MouseEventHandler<any>;

    // special cases
    max?: number; // 99+
};

type ImplChipProps<C extends React.ElementType = 'button'> = PolymorphicProps<
    C,
    OwnChipProps & Omit<BoxProps, 'size'>
>;

type ChipProps = OwnChipProps & Omit<BoxProps, 'size'>;

// export type ButtonProps = React.ButtonHTMLAttributes<HTMLElement> & {
// export type ChipProps = {
//     as?: React.ElementType;
//     className?: string;
//     children: React.ReactNode;
//     intent?: Intent;
//     variant?: Variant;
//     size?: Size;
//     disabled?: boolean;
//     selected?: boolean; // selected / current (pagination, tabs)
//     rounded?: BoxProps['rounded'];
//     startIcon?: React.ReactNode;
//     endIcon?: React.ReactNode;
//
//     focused?: boolean;
//
//     removable?: boolean;
//     onRemove?: () => void;
//
//     href?: string;
//     onClick?: React.MouseEventHandler<any>;
// } & {
//     onKeyDown?: React.KeyboardEventHandler<any>;
//     target?: React.HTMLAttributeAnchorTarget;
//     rel?: string;
// } & BoxProps;

//-----------------------------------------------------------
// Helpers
//-----------------------------------------------------------
export const prefix = (name: string = '') => {
    return classPrefix(`--chip${name}`);
};

const ImplChip = (
    {
        as = 'button',
        className,
        children,
        intent = 'primary',
        variant = 'base',
        size = 'md',
        disabled = false,
        selected = false,
        rounded = 'md',
        startIcon,
        endIcon,

        focused,

        removable = false,
        onRemove,

        // href,
        onClick,
        onKeyDown,

        ...rest
    }: ImplChipProps,
    ref: React.Ref<any>,
) => {
    const { href, target, rel } = rest as any;

    if (href && onClick) {
        console.warn('Chip: both href and onClick provided. href takes priority.');
    }

    const isLink = !!href;
    const behavesLikeButton = !isLink && !!onClick && !removable;
    const isInteractive = (isLink || behavesLikeButton) && !disabled && !removable;

    const handleClick = (e: React.MouseEvent<any>) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
        }

        onKeyDown?.(e);
    };

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // 🔥 critical
        e.preventDefault();
        if (disabled) return;
        onRemove?.();
    };

    return (
        <Box
            as={as}
            aria-disabled={disabled || undefined} // safe for any element
            aria-pressed={behavesLikeButton ? selected : undefined} // only for toggle buttons (not links)
            role={!behavesLikeButton && !isLink && isInteractive ? 'button' : undefined} // add for custom interactive elements (not button/link)
            rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel} // prevent window.opener security issues
            tabIndex={!behavesLikeButton && !isLink && isInteractive ? 0 : undefined} // enable focus for non-focusable interactive elements (link/button focusable)
            ref={ref}
            className={clsx(prefix(), className)}
            disabled={as === 'button' ? disabled : undefined}
            rounded={rounded}
            {...rest}
            type={as === 'button' ? 'button' : undefined}
            onClick={isInteractive ? handleClick : undefined}
            onKeyDown={!behavesLikeButton && !isLink && isInteractive ? handleKeyDown : undefined}
            data-variant={variant}
            data-intent={intent}
            data-size={size}
            data-removable={removable || undefined}
            data-disabled={disabled || undefined}
            data-selected={selected || undefined}
            data-interactive={isInteractive || undefined}
            data-focused={focused || undefined}
        >
            {/* START ICON */}
            {startIcon != null && <span className={prefix(`__icon`)}>{startIcon}</span>}

            {/* CONTENT */}
            <span className={prefix(`__content`)}>{children}</span>

            {/* END ICON */}
            {endIcon != null && <span className={prefix(`__icon`)}>{endIcon}</span>}

            {removable && (
                <button
                    type="button"
                    className={prefix('__remove')}
                    aria-label={typeof children === 'string' ? `Remove ${children}` : 'Remove'}
                    onClick={handleRemove}
                    disabled={disabled}
                >
                    <span className={prefix('__remove-icon')}>×</span>
                </button>
            )}
        </Box>
    );
};

export const Chip = createPolymorphic<ChipProps, 'button'>(forwardRef(ImplChip), 'Chip');

// Chip.displayName = 'Chip';

// export { Chip };
