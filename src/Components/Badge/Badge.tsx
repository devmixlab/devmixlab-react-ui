import React from 'react';
import clsx from 'clsx';
import { Box, BoxComponentProps, type BoxProps } from '../Box';
import { classPrefix } from '../../utils/classPrefix';

//------------------------------------------------------------
// Types
//------------------------------------------------------------

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof sizes)[number];

export type Variant = 'solid' | 'base' | 'outlined';
export type Intent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type OwnBadgeProps = {
    intent?: Intent;
    variant?: Variant;
    size?: Size;

    number?: number; // to format value as tabular-nums

    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    iconOnly?: boolean;

    // special cases
    dot?: boolean; // small dot __badge
    max?: number; // 99+
};

export type BadgeProps = Omit<BoxComponentProps<'div'>, 'size'> & OwnBadgeProps;

//------------------------------------------------------------
// Helpers
//------------------------------------------------------------

export const prefix = (name: string = '') => {
    return classPrefix(`--badge${name}`);
};

//------------------------------------------------------------
// Component
//------------------------------------------------------------

const Badge = ({
    children,
    className,

    title,

    intent = 'primary',
    variant = 'base',
    size = 'md',
    rounded = 'sm',

    number,

    startIcon,
    endIcon,
    iconOnly = false,

    dot = false,
    max,

    ...props
}: BadgeProps) => {
    const isDot = dot;

    if (isDot && children != null) {
        console.warn('Badge: `dot` is true but `children` were provided.');
    }

    if (iconOnly && (startIcon || endIcon)) {
        console.warn('Badge: `iconOnly` cannot be used together with `startIcon` or `endIcon`.');
    }

    if (number != null && children != null) {
        console.warn('Badge: `number` and `children` cannot be used together.');
    }

    if (iconOnly && number != null) {
        console.warn('Badge: `iconOnly` and `number` cannot be used together.');
    }

    if (
        isDot &&
        (children != null || number != null || startIcon != null || endIcon != null || iconOnly)
    ) {
        console.warn('Badge: `dot` cannot be combined with content, icons, or numbers.');
    }

    if (iconOnly && children == null) {
        console.warn('Badge: `iconOnly` requires an icon as children.');
    }

    const isNumber = number != null;
    const isNumberExceedsMax = isNumber && max != null && number > max;
    const resolvedNumber = !isNumber ? null : isNumberExceedsMax ? `${max}+` : String(number);
    const resolvedTitle = title ?? (isNumberExceedsMax ? String(number) : undefined);

    const hasContent = isDot || isNumber || children != null;

    if (!hasContent) return null;

    return (
        <Box
            title={resolvedTitle}
            className={clsx(prefix(), className)}
            rounded={isDot ? undefined : rounded}
            aria-hidden={isDot ? true : undefined}
            data-intent={intent}
            data-variant={!isDot ? variant : undefined}
            data-size={size}
            data-icon-only={iconOnly || undefined}
            data-dot={isDot || undefined}
            data-numeric={isNumber || undefined}
            data-number-exceeds-max={isNumberExceedsMax || undefined}
            {...props}
        >
            {/* START ICON */}
            {startIcon && <span className={prefix(`__icon`)}>{startIcon}</span>}

            {!isDot && !iconOnly && (
                <span className={prefix('__content')}>{isNumber ? resolvedNumber : children}</span>
            )}

            {/* ICON ONLY */}
            {iconOnly && <span className={prefix('__icon')}>{children}</span>}

            {/* END ICON */}
            {endIcon && <span className={prefix(`__icon`)}>{endIcon}</span>}
        </Box>
    );
};

Badge.displayName = 'Badge';

export { Badge };
