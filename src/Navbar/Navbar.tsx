import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import { Button } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import { NavbarContext, useNavbarContext, NavbarContextValue } from './Navbar.context';
import {
    NavbarProps,
    NavbarBrandProps,
    NavbarContentProps,
    NavbarItemsProps,
    NavbarItemRenderProps,
    NavbarItemProps,
    NavbarToggleProps,
    NavbarMobileProps,
} from './Navbar.types';
import { useStableId } from '../utils/useStableId';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--navbar${name}`);

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

        const itemRefs = useRef<Map<string, HTMLElement | null>>(new Map());

        const registerItem = useCallback((id: string, node: HTMLElement | null) => {
            itemRefs.current.set(id, node);
        }, []);

        const unregisterItem = useCallback((id: string) => {
            itemRefs.current.delete(id);
        }, []);

        return (
            <NavbarContext.Provider
                value={{
                    mobileOpen,
                    setMobileOpen,
                    itemRefs,
                    registerItem,
                    unregisterItem,
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

const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
    ({ children, className, active = false, disabled = false, render, ...rest }, ref) => {
        const [focusedVisible, setFocusedVisible] = useState(false);
        const [pressed, setPressed] = useState(false);

        const { registerItem, unregisterItem, itemRefs } = useNavbarContext();

        const id = useStableId();

        const handleKeyDown = (e: React.KeyboardEvent) => {
            const items = Array.from(itemRefs.current.entries()).filter(([, node]) => node);

            const currentIndex = items.findIndex(([itemId]) => itemId === id);

            if (currentIndex === -1) return;

            switch (e.key) {
                case 'ArrowRight': {
                    e.preventDefault();

                    const next = items[currentIndex + 1] ?? items[0];

                    next?.[1]?.focus();

                    break;
                }

                case 'ArrowLeft': {
                    e.preventDefault();

                    const prev = items[currentIndex - 1] ?? items[items.length - 1];

                    prev?.[1]?.focus();

                    break;
                }

                case 'Home': {
                    e.preventDefault();

                    items[0]?.[1]?.focus();

                    break;
                }

                case 'End': {
                    e.preventDefault();

                    items[items.length - 1]?.[1]?.focus();

                    break;
                }
            }
        };

        useEffect(() => {
            return () => {
                unregisterItem(id);
            };
        }, [id, unregisterItem]);

        return (
            <Box
                tabIndex={disabled ? -1 : 0}
                ref={ref}
                className={clsx(prefix('__item'), className)}
                onKeyDown={(e) => {
                    if (disabled) return;
                    handleKeyDown(e);
                    rest.onKeyDown?.(e);
                }}
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
                        register: (el) => {
                            registerItem(id, el);
                        },
                    })
                ) : (
                    <Button
                        ref={(node) => {
                            registerItem(id, node);
                        }}
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
