import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box';
import { classPrefix } from '../../utils/classPrefix';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { Close as CloseIcon } from '../Icon';

//---------------------------------------------------------------
// Types
//---------------------------------------------------------------

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof sizes)[number];

export type Variant = 'solid' | 'base' | 'outlined' | 'ghost' | (string & {});
export type Intent =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | (string & {});

export type OwnChipProps = {
    intent?: Intent;
    variant?: Variant;
    size?: Size;

    disabled?: boolean;
    selected?: boolean; // selected / current (pagination, tabs)

    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    iconOnly?: boolean;

    removable?: boolean;
    onRemove?: () => void;
};

type ImplChipProps<C extends React.ElementType = 'button'> = PolymorphicProps<
    C,
    OwnChipProps & Omit<BoxProps, 'size'>
>;

type ChipProps = OwnChipProps & Omit<BoxProps, 'size'>;

//-----------------------------------------------------------
// Helpers
//-----------------------------------------------------------
export const prefix = (name: string = '') => {
    return classPrefix(`--chip${name}`);
};

const ImplChip = <C extends React.ElementType = 'button'>(
    {
        as,
        className,
        children,
        intent = 'primary',
        variant = 'base',
        size = 'md',

        rounded = 'sm',

        startIcon,
        endIcon,
        iconOnly = false,

        disabled = false,
        selected = false,

        removable = false,
        onRemove,

        onClick,
        onKeyDown,

        ...rest
    }: ImplChipProps<C>,
    ref: React.Ref<any>,
) => {
    const { href, target, rel } = rest as any;

    if (iconOnly && children == null) {
        console.warn('Chip: `iconOnly` requires children.');
    }

    if (iconOnly && (startIcon || endIcon)) {
        console.warn('Chip: `iconOnly` cannot be used together with `startIcon` or `endIcon`.');
    }

    if (iconOnly && removable) {
        console.warn('Chip: `iconOnly` cannot be used together with `removable`.');
    }

    const resolvedAs: React.ElementType = removable ? 'div' : (as ?? 'button');

    if (href && onClick) {
        console.warn('Chip: both href and onClick provided. href takes priority.');
    }

    if (removable && onClick) {
        console.warn(
            'Chip: removable chips do not support onClick. Use the remove button instead.',
        );
    }

    if (onRemove && !removable) {
        console.warn('Chip: `onRemove` has no effect unless `removable` is true.');
    }

    const isButton = resolvedAs === 'button';
    const isLink = resolvedAs === 'a' || (!!href && !isButton && !removable);
    const isInteractive = (isButton || isLink || !!onClick) && !disabled && !removable;

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
            {...rest}
            as={resolvedAs}
            aria-disabled={disabled || undefined} // safe for any element
            aria-pressed={isButton ? selected : undefined} // only for toggle buttons (not links)
            role={!isButton && !isLink && isInteractive ? 'button' : undefined} // add for custom interactive elements (not button/link)
            rel={isLink ? (target === '_blank' ? (rel ?? 'noopener noreferrer') : rel) : undefined} // prevent window.opener security issues
            tabIndex={!isButton && !isLink && isInteractive ? 0 : undefined} // enable focus for non-focusable interactive elements (link/button focusable)
            ref={ref}
            className={clsx(prefix(), className)}
            disabled={isButton ? disabled : undefined}
            rounded={rounded}
            type={isButton ? 'button' : undefined}
            onClick={isInteractive ? handleClick : undefined}
            onKeyDown={!isButton && !isLink && isInteractive ? handleKeyDown : undefined}
            data-variant={variant}
            data-intent={intent}
            data-size={size}
            data-icon-only={iconOnly || undefined}
            data-removable={removable || undefined}
            data-disabled={disabled || undefined}
            data-selected={selected || undefined}
            data-interactive={isInteractive || undefined}
        >
            {/* START ICON */}
            {startIcon != null && <span className={prefix(`__icon`)}>{startIcon}</span>}

            {/* CONTENT */}
            {!iconOnly && <span className={prefix(`__content`)}>{children}</span>}

            {/* END ICON */}
            {endIcon != null && <span className={prefix(`__icon`)}>{endIcon}</span>}

            {/* ICON ONLY */}
            {iconOnly && <span className={prefix('__icon')}>{children}</span>}

            {removable && (
                <Box
                    as="button"
                    type="button"
                    rounded="xs"
                    className={prefix('__remove')}
                    aria-label={typeof children === 'string' ? `Remove ${children}` : 'Remove'}
                    onClick={handleRemove}
                    disabled={disabled}
                >
                    <span className={prefix('__remove-icon')}>
                        <CloseIcon />
                    </span>
                </Box>
            )}
        </Box>
    );
};

export const Chip = createPolymorphic<ChipProps, 'button'>(forwardRef(ImplChip), 'Chip');

// Chip.displayName = 'Chip';

// export { Chip };
