import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import { Button } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import { NavbarContext, useNavbarContext, NavbarContextValue } from './Navbar.context';
import { FocusableItem, useFocusableList } from '../hooks/useFocusableList';
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
        const [items, setItems] = useState<FocusableItem[]>([]);

        const focusableList = useFocusableList(items);

        const registerItem = useCallback((item: FocusableItem) => {
            setItems((prev) => {
                const exists = prev.some((x) => x.id === item.id);

                if (exists) {
                    return prev.map((x) => (x.id === item.id ? item : x));
                }

                return [...prev, item];
            });
        }, []);

        const unregisterItem = useCallback((id: string) => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }, []);

        return (
            <NavbarContext.Provider
                value={{
                    mobileOpen,
                    setMobileOpen,
                    focusableList,
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
        const [pressed, setPressed] = useState(false);

        const { focusableList, registerItem, unregisterItem } = useNavbarContext();

        const id = useStableId();

        const {
            focusedId,
            focusNext,
            focusFirst,
            focusLast,
            focusById,
            setFocusedId,
            setFocusedVisibleId,
            setRef,
        } = focusableList;

        useEffect(() => {
            registerItem({
                id,
                disabled,
            });

            return () => {
                unregisterItem(id);
            };
        }, [id, disabled, registerItem, unregisterItem]);

        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight': {
                    e.preventDefault();
                    focusNext(1);
                    break;
                }

                case 'ArrowLeft': {
                    e.preventDefault();
                    focusNext(-1);
                    break;
                }

                case 'Home': {
                    e.preventDefault();
                    focusFirst();
                    break;
                }

                case 'End': {
                    e.preventDefault();
                    focusLast();
                    break;
                }
            }
        };

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

                    setFocusedId(id);
                    setFocusedVisibleId(e.currentTarget.matches(':focus-visible') ? id : null);
                }}
                onBlur={() => {
                    setFocusedId(null);
                    setFocusedVisibleId(null);
                }}
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
                        focusedVisible: focusedId === id,
                        pressed,
                        register: setRef(id),
                    })
                ) : (
                    <Button
                        ref={setRef(id)}
                        type="button"
                        tabIndex={-1}
                        variant="base"
                        intent="secondary"
                        disabled={disabled}
                        pseudoFocused={focusedId === id}
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
