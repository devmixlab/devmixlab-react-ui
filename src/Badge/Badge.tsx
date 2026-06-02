import React from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Components/Box/Box';
import { Size, Intent, Variant } from './badge.tokens';
import { prefix } from './badge.helpers';

export type BadgeProps = {
    children?: React.ReactNode;
    className?: string;

    intent?: Intent;
    variant?: Variant;
    size?: Size;
    rounded?: BoxProps['rounded'];

    // special cases
    dot?: boolean; // small dot __badge
    max?: number; // 99+
};

const Badge = ({
    children,
    className,

    intent = 'primary',
    variant = 'base',
    size = 'md',
    rounded = 'sm',

    dot = false,
    max,

    ...props
}: BadgeProps) => {
    const isDot = dot;

    if (isDot && children != null) {
        console.warn('Badge: `dot` is true but `children` were provided.');
    }

    const isExceedsMax = typeof children === 'number' && max != null && children > max;

    const content = isDot ? null : isExceedsMax ? `${max}+` : children;

    if (!isDot && content == null) return null;

    const cl = clsx(className, prefix(), prefix(`--${intent}`), prefix(`--size-${size}`), {
        [prefix(`--${variant}`)]: !isDot,
        [prefix('--dot')]: isDot,
    });

    return (
        <Box
            title={isExceedsMax ? String(children) : undefined}
            className={cl}
            rounded={isDot ? undefined : rounded}
            aria-hidden={isDot ? true : undefined}
            data-intent={intent}
            data-variant={variant}
            data-size={size}
            {...props}
        >
            {!isDot && <span className={prefix('__content')}>{content}</span>}
        </Box>
    );
};

Badge.displayName = 'Badge';

export { Badge };
