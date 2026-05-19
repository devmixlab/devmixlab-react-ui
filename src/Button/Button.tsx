import React, { useEffect, useState, forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box/Box';
import { createPolymorphic } from '../types/polymorphic';
import { LoadingPosition, Size, Intent, Variant } from './button.tokens';
import { isLongNumber, prefix } from './button.helpers';
import { DefaultSpinner } from '../Spinner/DefaultSpinner';

// export type ButtonProps = React.ButtonHTMLAttributes<HTMLElement> & {
export type ButtonProps = {
    className?: string;
    children?: React.ReactNode;
    intent?: Intent;
    variant?: Variant;
    size?: Size;
    number?: number; // to format value as tabular-nums
    disabled?: boolean;
    pseudoFocused?: boolean;
    pseudoActive?: boolean;
    active?: boolean; // selected / current (pagination, tabs)
    noInteraction?: boolean; // removes hover/active interaction styles
    // fullWidth?: boolean;
    rounded?: BoxProps['rounded'];
    iconOnly?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    loading?: boolean;
    loadingPosition?: LoadingPosition;
    spinnerDelay?: number;
    loadingComponent?: React.ReactNode;
};

export type ButtonImplProps = ButtonProps & {
    as?: React.ElementType;
    type?: 'button' | 'submit' | 'reset';
} & {
    onClick?: React.MouseEventHandler<any>;
    onKeyDown?: React.KeyboardEventHandler<any>;
};

const ButtonImpl = (
    {
        className,
        children,
        as = 'button',
        type = 'button',
        intent = 'primary',
        variant = 'base',
        size = 'md',
        number,
        disabled = false,
        pseudoFocused,
        pseudoActive,
        active = false,
        noInteraction = false,
        // fullWidth = false,
        rounded = 'md',
        iconOnly = false,
        startIcon,
        endIcon,
        loading = false,
        loadingPosition = 'center',
        spinnerDelay = 150,
        loadingComponent,
        ...props
    }: ButtonImplProps,
    ref: React.Ref<any>,
) => {
    const [showSpinner, setShowSpinner] = useState(false);

    const loader = loadingComponent ?? <DefaultSpinner />;

    const isButton = as === 'button';
    const isDisabled = disabled || loading || noInteraction;

    const { onClick, onKeyDown, ...restProps } = props;

    const cl = clsx(
        className,
        prefix(),
        // prefix(`--${variant}`),
        // prefix(`--${intent}`),
        // prefix(`--size-${size}`),
        {
            // [prefix(`--numeric`)]: number != null,
            // [prefix(`--long`)]: isLongNumber(number, 2),
            // [prefix(`--disabled`)]: disabled,
            // [prefix(`--active`)]: active,
            // [prefix(`--no-interaction`)]: noInteraction,
            // [bs.fullWidth]: fullWidth,
            // [prefix(`--icon-only`)]: iconOnly,
            // [prefix(`--loading`)]: showSpinner,
            // [prefix(`--loading-${loadingPosition}`)]: showSpinner,
        },
    );

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let frameId: number | null = null;

        if (loading) {
            timeoutId = setTimeout(() => {
                setShowSpinner(true);
            }, spinnerDelay);
        } else {
            frameId = requestAnimationFrame(() => {
                setShowSpinner(false);
            });
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [loading, spinnerDelay]);

    const handleClick = (e: React.MouseEvent<any>) => {
        if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
        if (isDisabled) {
            e.preventDefault();
            return;
        }

        if (!isButton && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick(e as any);
        }

        onKeyDown?.(e);
    };

    return (
        <Box
            aria-busy={showSpinner}
            aria-disabled={isDisabled}
            role={!isButton ? 'button' : undefined}
            tabIndex={pseudoFocused !== undefined ? -1 : !isButton && !isDisabled ? 0 : undefined}
            as={as}
            type={isButton ? type : undefined}
            ref={ref}
            className={cl}
            disabled={isButton ? isDisabled : undefined}
            rounded={rounded}
            {...restProps}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            data-size={size}
            data-intent={intent}
            data-variant={variant}
            data-numeric={number != null ? true : undefined}
            data-long-number={isLongNumber(number, 2) ? true : undefined}
            data-disabled={disabled || undefined}
            data-active={active || undefined}
            data-no-interaction={noInteraction || undefined}
            data-icon-only={iconOnly || undefined}
            data-loading={showSpinner || undefined}
            data-loading-position={showSpinner ? loadingPosition : undefined}
            data-pseudo-focused={pseudoFocused || undefined}
            data-pseudo-active={pseudoActive || undefined}
        >
            {/* START ICON */}
            {startIcon &&
                !(showSpinner && (loadingPosition === 'start' || loadingPosition === 'center')) && (
                    <span className={prefix(`__icon`)}>{startIcon}</span>
                )}

            {/* START SPINNER */}
            {showSpinner && loadingPosition === 'start' && (
                <span className={prefix('__loader')}>{loader}</span>
            )}

            {/* CONTENT */}
            <span className={prefix(`__content`)}>{number != null ? number : children}</span>

            {/* END ICON */}
            {endIcon &&
                !(showSpinner && (loadingPosition === 'end' || loadingPosition === 'center')) && (
                    <span className={prefix(`__icon`)}>{endIcon}</span>
                )}

            {/* END SPINNER */}
            {showSpinner && loadingPosition === 'end' && (
                <span className={prefix('__loader')}>{loader}</span>
            )}

            {/* CENTER SPINNER */}
            {showSpinner && loadingPosition === 'center' && (
                <span className={prefix('__loader')}>{loader}</span>
            )}
        </Box>
    );
};

export const Button = createPolymorphic<ButtonProps, 'button'>(forwardRef(ButtonImpl), 'Button');
