import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box/Box';
import { Size, Intent, Variant } from './chip.tokens';
import { prefix } from './chip.helpers';

// export type ButtonProps = React.ButtonHTMLAttributes<HTMLElement> & {
export type ChipProps = {
    as?: React.ElementType;
    className?: string;
    children: React.ReactNode;
    intent?: Intent;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    selected?: boolean; // selected / current (pagination, tabs)
    rounded?: BoxProps['rounded'];
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;

    focused?: boolean;

    removable?: boolean;
    onRemove?: () => void;

    href?: string;
    onClick?: React.MouseEventHandler<any>;
} & {
    onKeyDown?: React.KeyboardEventHandler<any>;
    target?: React.HTMLAttributeAnchorTarget;
    rel?: string;
};

const Chip = forwardRef(
    (
        {
            as,
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

            href,
            onClick,

            ...props
        }: ChipProps,
        ref: React.Ref<any>,
    ) => {
        const { onKeyDown, ...restProps } = props;

        if (href && onClick) {
            console.warn('Chip: both href and onClick provided. href takes priority.');
        }

        const isLink = !!href;
        const isLinkOnly = isLink && !removable;
        const isButton = !isLink && !!onClick && !removable;
        const isInteractive = (isLink || isButton) && !disabled && !removable;

        const Component = as ?? (isLinkOnly ? 'a' : isButton ? 'button' : 'span');

        const cl = clsx(
            className,
            prefix(),
            prefix(`--${variant}`),
            prefix(`--${intent}`),
            prefix(`--size-${size}`),
            {
                [prefix(`--removable`)]: removable,
                [prefix(`--disabled`)]: disabled,
                [prefix(`--selected`)]: selected,
                [prefix(`--interactive`)]: isInteractive,
                [prefix(`--focused`)]: focused,
            },
        );

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
                aria-disabled={disabled || undefined} // safe for any element
                aria-pressed={isButton ? selected : undefined} // only for toggle buttons (not links)
                role={!isButton && !isLink && isInteractive ? 'button' : undefined} // add for custom interactive elements (not button/link)
                rel={
                    restProps.target === '_blank'
                        ? (restProps.rel ?? 'noopener noreferrer')
                        : restProps.rel
                } // prevent window.opener security issues
                tabIndex={!isButton && !isLink && isInteractive ? 0 : undefined} // enable focus for non-focusable interactive elements (link/button focusable)
                href={href}
                as={Component}
                type={Component === 'button' ? 'button' : undefined}
                ref={ref}
                className={cl}
                disabled={Component === 'button' ? disabled : undefined}
                rounded={rounded}
                {...restProps}
                onClick={isInteractive ? handleClick : undefined}
                onKeyDown={!isButton && !isLink && isInteractive ? handleKeyDown : undefined}
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
    },
);

Chip.displayName = 'Chip';

export { Chip };
