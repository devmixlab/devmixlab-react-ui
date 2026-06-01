import React, { useEffect, useState, forwardRef } from 'react';
import clsx from 'clsx';
import { Box, BoxComponentProps, type BoxProps } from '../Box/Box';
import { createPolymorphic } from '../types/polymorphic';
import { LoadingPosition, Size, Intent, Variant } from './button.tokens';
import { isLongNumber, prefix } from './Button.helpers';
import { DefaultSpinner } from '../Spinner/DefaultSpinner';

export type ButtonProps<C extends React.ElementType = 'button'> = BoxComponentProps<
    C,
    {
        className?: string;
        children?: React.ReactNode;
        intent?: Intent;
        variant?: Variant;
        size?: Size;
        number?: number; // to format value as tabular-nums
        disabled?: boolean;
        active?: boolean; // selected / current (pagination, tabs)
        noInteraction?: boolean; // removes hover/active interaction styles
        rounded?: BoxProps['rounded'];
        iconOnly?: boolean;
        startIcon?: React.ReactNode;
        endIcon?: React.ReactNode;
        loading?: boolean;
        loadingPosition?: LoadingPosition;
        spinnerDelay?: number;
        loadingComponent?: React.ReactNode;
    }
>;

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
        active = false,
        noInteraction = false,
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

    const cl = clsx(className, prefix());

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
            tabIndex={!isButton ? (isDisabled ? -1 : 0) : undefined}
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
