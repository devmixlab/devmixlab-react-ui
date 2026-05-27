import React, { forwardRef, useState } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';

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

export type NavbarItemProps<C extends React.ElementType = 'button'> = BoxComponentProps<
    C,
    {
        active?: boolean;
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

const NavbarItem = forwardRef<HTMLButtonElement, NavbarItemProps>(
    ({ children, className, active = false, ...rest }, ref) => {
        return (
            <Box
                as="button"
                ref={ref}
                className={clsx(prefix('__item'), className)}
                type="button"
                px={3}
                rounded="md"
                aria-current={active ? 'page' : undefined}
                data-active={active || undefined}
                {...rest}
            >
                {children}
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
