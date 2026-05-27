import React, { forwardRef, useState } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import { Button } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--navbar${name}`);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type NavbarProps<C extends React.ElementType = 'nav'> = BoxComponentProps<
    C,
    {
        sticky?: boolean;
        bordered?: boolean;
        elevated?: boolean;
        centered?: boolean;
    }
>;

export type NavbarBrandProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

export type NavbarContentProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

export type NavbarItemsProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

type NavbarItemRenderProps = {
    disabled: boolean;
    active: boolean;
    focusedVisible: boolean;
    pressed: boolean;
};

export type NavbarItemProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        active?: boolean;
        disabled?: boolean;
        render?: (props: NavbarItemRenderProps) => React.ReactNode;
    }
>;

export type NavbarToggleProps<C extends React.ElementType = 'button'> = BoxComponentProps<C>;

export type NavbarMobileProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type NavbarContextValue = {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NavbarContext = React.createContext<NavbarContextValue | null>(null);

const useNavbarContext = () => {
    const ctx = React.useContext(NavbarContext);

    if (!ctx) {
        throw new Error('Navbar components must be used inside <Navbar>');
    }

    return ctx;
};

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type NavbarCompound = typeof NavbarRoot & {
    Brand: typeof NavbarBrand;
    Content: typeof NavbarContent;
    Items: typeof NavbarItems;
    Item: typeof NavbarItem;
    Toggle: typeof NavbarToggle;
    Mobile: typeof NavbarMobile;
};

const NavbarRoot = forwardRef<HTMLElement, NavbarProps>(
    (
        {
            children,
            className,
            sticky = false,
            bordered = true,
            elevated = false,
            centered = false,
            ...rest
        },
        ref,
    ) => {
        const [mobileOpen, setMobileOpen] = useState(false);

        return (
            <NavbarContext.Provider
                value={{
                    mobileOpen,
                    setMobileOpen,
                }}
            >
                <Box
                    as="nav"
                    ref={ref}
                    className={clsx(prefix(), className)}
                    data-sticky={sticky || undefined}
                    data-bordered={bordered || undefined}
                    data-elevated={elevated || undefined}
                    {...rest}
                >
                    <Box className={prefix('__inner')} data-centered={centered || undefined}>
                        {children}
                    </Box>
                </Box>
            </NavbarContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Brand
// -----------------------------------------------------------------------------

const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__brand'), className)} fontSize="lg" {...rest}>
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

const NavbarContent = forwardRef<HTMLDivElement, NavbarContentProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__content'), className)} gap={4} {...rest}>
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Items
// -----------------------------------------------------------------------------

const NavbarItems = forwardRef<HTMLDivElement, NavbarItemsProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__items'), className)} gap={2} {...rest}>
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

// type TriggerRenderProps = {
//     disabled: boolean;
//     active: boolean;
//     focusedVisible: boolean;
//     pressed: boolean;
// };

// type NavbarItemProps = React.HTMLAttributes<HTMLDivElement> & {
//     className?: string;
//     children?: React.ReactNode;
//     chevron?: boolean;
//     render?: (props: TriggerRenderProps) => React.ReactNode;
// };

const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
    ({ children, className, active = false, disabled = false, render, ...rest }, ref) => {
        const [focusedVisible, setFocusedVisible] = useState(false);
        const [pressed, setPressed] = useState(false);

        return (
            <Box
                tabIndex={disabled ? -1 : 0}
                ref={ref}
                className={clsx(prefix('__item'), className)}
                onFocus={(e) => {
                    if (disabled) return;
                    setFocusedVisible(e.currentTarget.matches(':focus-visible'));
                }}
                onBlur={() => setFocusedVisible(false)}
                onMouseDown={() => {
                    if (disabled) return;
                    setPressed(true);
                }}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                aria-current={active ? 'page' : undefined}
                data-active={active || undefined}
                {...rest}
            >
                {render ? (
                    render({
                        disabled,
                        active,
                        focusedVisible,
                        pressed,
                    })
                ) : (
                    <Button
                        type="button"
                        tabIndex={-1}
                        variant="base"
                        intent="secondary"
                        disabled={disabled}
                        pseudoFocused={focusedVisible}
                        pseudoActive={pressed}
                        active={active}
                    >
                        {children}
                    </Button>
                )}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Toggle
// -----------------------------------------------------------------------------

const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(
    ({ children, className, ...rest }, ref) => {
        const { mobileOpen, setMobileOpen } = useNavbarContext();

        return (
            <Box
                as="button"
                ref={ref}
                className={clsx(prefix('__toggle'), className)}
                type="button"
                borderRadius="md"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                onClick={() => setMobileOpen((prev) => !prev)}
                data-mobile-opened={mobileOpen}
                {...rest}
            >
                {children ?? '☰'}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Mobile
// -----------------------------------------------------------------------------

const NavbarMobile = forwardRef<HTMLDivElement, NavbarMobileProps>(
    ({ children, className, ...rest }, ref) => {
        const { mobileOpen } = useNavbarContext();

        if (!mobileOpen) {
            return null;
        }

        return (
            <Box
                ref={ref}
                className={clsx(prefix('__mobile'), className)}
                gap={2}
                padding={4}
                {...rest}
            >
                {children}
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Compound export
// -----------------------------------------------------------------------------

export const Navbar = NavbarRoot as NavbarCompound;

Navbar.Brand = NavbarBrand;
Navbar.Content = NavbarContent;
Navbar.Items = NavbarItems;
Navbar.Item = NavbarItem;
Navbar.Toggle = NavbarToggle;
Navbar.Mobile = NavbarMobile;
