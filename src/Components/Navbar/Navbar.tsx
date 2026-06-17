import React, { forwardRef, useState, useRef, useCallback, useEffect, useMemo } from 'react';

import { clsx } from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';
import { classPrefix } from '../../utils/classPrefix';
import { Button, ButtonProps } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import {
    NavbarContext,
    useNavbarContext,
    NavbarContextValue,
    NavbarMobileContext,
    useNavbarMobileContext,
    NavbarMobileContextValue,
} from './Navbar.context';
import { FocusableItem, useFocusableList } from '../../hooks/useFocusableList';
import {
    NavbarProps,
    NavbarBrandProps,
    NavbarContentProps,
    NavbarItemsProps,
    NavbarItemRenderProps,
    NavbarItemProps,
    NavbarToggleProps,
    NavbarMobileProps,
    NavbarHeaderProps,
    FocusScope,
    NavbarItemElementProps,
} from './Navbar.types';
import { useStableId } from '../../utils/useStableId';
import { breakpointOrder, useBreakpoint } from '../../utils/responsive';
import { Collapse } from '../Collapse/Collapse';
import { mergeRefs } from '../../utils/mergeRefs';
import {
    useFocusTrap,
    useRestoreFocus,
    useEscapeKey,
    useFocusOutside,
    usePointerOutside,
    useNestedLayers,
} from '../../hooks';

import { Burger as BurgerIcon } from '../Icon';

import { Card } from '../Card';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--navbar${name}`);

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type NavbarCompound = typeof NavbarRoot & {
    Brand: typeof NavbarBrand;
    Header: typeof NavbarHeader;
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
            collapseBreakpoint = 'md',
            closeOnSelect = true,
            backdrop = true,

            focusTrap = false,
            closeOnEscape = true,
            closeOnFocusOutside = true,
            closeOnPointerOutside = true,

            ...rest
        },
        ref,
    ) => {
        const [mobileOpen, setMobileOpen] = useState(false);
        const [items, setItems] = useState<FocusableItem[]>([]);
        const [mobileItems, setMobileItems] = useState<FocusableItem[]>([]);

        const nestedLayers = useNestedLayers();

        // const nestedLayersRef = useRef(new Set<HTMLElement>());
        //
        // const registerNestedLayer = useCallback((node: HTMLElement) => {
        //     nestedLayersRef.current.add(node);
        // }, []);
        //
        // const unregisterNestedLayer = useCallback((node: HTMLElement) => {
        //     nestedLayersRef.current.delete(node);
        // }, []);

        const rootRef = useRef<HTMLDivElement | null>(null);
        const toggleRef = useRef<HTMLButtonElement | null>(null);

        const mobileId = useStableId();

        const { breakpoint } = useBreakpoint();
        const collapsed =
            collapseBreakpoint != null &&
            breakpointOrder.indexOf(breakpoint) < breakpointOrder.indexOf(collapseBreakpoint);

        useEffect(() => {
            if (!collapsed) {
                setMobileOpen(false);
            }
        }, [collapsed]);

        const focusableList = useFocusableList(items);
        const focusableMobileList = useFocusableList(mobileItems);

        const registerItem = useCallback((item: FocusableItem, scope: FocusScope) => {
            const setter = scope === 'mobile' ? setMobileItems : setItems;

            setter((prev) => {
                const exists = prev.some((x) => x.id === item.id);

                if (exists) {
                    return prev.map((x) => (x.id === item.id ? item : x));
                }

                return [...prev, item];
            });
        }, []);

        const unregisterItem = useCallback((id: string, scope: FocusScope) => {
            const setter = scope === 'mobile' ? setMobileItems : setItems;
            setter((prev) => prev.filter((item) => item.id !== id));
        }, []);

        return (
            <NavbarContext.Provider
                value={{
                    mobileOpen,
                    setMobileOpen,
                    mobileId,
                    focusableList,
                    focusableMobileList,
                    registerItem,
                    unregisterItem,
                    collapsed,
                    closeOnSelect,
                    rootRef,
                    toggleRef,

                    focusTrap,
                    closeOnEscape,
                    closeOnFocusOutside,
                    closeOnPointerOutside,

                    nestedLayers,
                }}
            >
                {collapsed && mobileOpen && backdrop && closeOnPointerOutside && (
                    <Box
                        className={prefix('__backdrop')}
                        onPointerDown={() => {
                            setMobileOpen(false);
                        }}
                    />
                )}
                <Box
                    as="nav"
                    tabIndex={-1}
                    ref={mergeRefs(rootRef, ref)}
                    className={clsx(prefix(), className)}
                    data-sticky={sticky || undefined}
                    data-bordered={bordered || undefined}
                    data-elevated={elevated || undefined}
                    data-collapsed={collapsed}
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
// Header
// -----------------------------------------------------------------------------

const NavbarHeader = forwardRef<HTMLDivElement, NavbarHeaderProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__header'), className)} {...rest}>
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
        const { collapsed } = useNavbarContext();

        if (collapsed) {
            return null;
        }

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

const NavbarItem = forwardRef<HTMLElement, NavbarItemProps>(
    (
        {
            children,
            className,
            active = false,
            disabled = false,
            render,
            onClick,
            onKeyDown,
            onFocus,
            ...rest
        },
        ref,
    ) => {
        const { insideMobile } = useNavbarMobileContext();

        const {
            focusableList,
            focusableMobileList,
            registerItem,
            unregisterItem,
            closeOnSelect,
            collapsed,
            setMobileOpen,
            nestedLayers,
        } = useNavbarContext();

        const { createNestedLayerRef } = nestedLayers;

        const id = useStableId();

        const currentFocusableList = insideMobile ? focusableMobileList : focusableList;

        const { focusNext, focusFirst, focusLast, setFocusedId, setRef, isFocusableElement } =
            currentFocusableList;

        useEffect(() => {
            registerItem(
                {
                    id,
                    disabled,
                },
                insideMobile ? 'mobile' : 'desktop',
            );

            return () => {
                unregisterItem(id, insideMobile ? 'mobile' : 'desktop');
            };
        }, [id, disabled, registerItem, unregisterItem]);

        const isVertical = insideMobile;

        const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight'];

        const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft'];

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (nextKeys.includes(e.key)) {
                e.preventDefault();
                focusNext(1);
                return;
            }

            if (prevKeys.includes(e.key)) {
                e.preventDefault();
                focusNext(-1);
                return;
            }

            switch (e.key) {
                case 'Home':
                    e.preventDefault();
                    focusFirst();
                    break;

                case 'End':
                    e.preventDefault();
                    focusLast();
                    break;
            }
        };

        const itemClassName = clsx(prefix('__item'), className);

        const itemProps = {
            ref: mergeRefs(ref, setRef(id)),

            onClick: (e: React.MouseEvent<HTMLElement>) => {
                onClick?.(e as any);

                if (collapsed && closeOnSelect && !disabled) {
                    setMobileOpen(false);
                }
            },

            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                if (disabled) {
                    return;
                }

                const target = e.target;

                if (!(target instanceof Node)) {
                    return;
                }

                if (!isFocusableElement(target)) {
                    return;
                }

                handleKeyDown(e);

                onKeyDown?.(e as React.KeyboardEvent<HTMLButtonElement>);
            },

            onFocus: (e: React.FocusEvent<HTMLElement>) => {
                if (disabled) {
                    return;
                }

                setFocusedId(id);

                onFocus?.(e as React.FocusEvent<HTMLButtonElement>);
            },

            'aria-current': active ? ('page' as const) : undefined,

            'data-active': active || undefined,
        };

        if (render) {
            return render({
                disabled,
                active,
                itemProps,
                className: itemClassName,

                createNestedLayerRef,
            });
        }

        return (
            <Button
                {...rest}
                {...itemProps}
                className={itemClassName}
                type="button"
                variant={insideMobile ? 'ghost' : 'base'}
                intent="secondary"
                disabled={disabled}
                active={active}
                w={insideMobile ? 'full' : undefined}
                justify={insideMobile ? 'start' : undefined}
                rounded={insideMobile ? 'none' : undefined}
            >
                {children}
            </Button>
        );
    },
);

// -----------------------------------------------------------------------------
// Toggle
// -----------------------------------------------------------------------------

const NavbarToggle = forwardRef<HTMLButtonElement, NavbarToggleProps>(
    ({ children, className, ...rest }, ref) => {
        const {
            mobileOpen,
            setMobileOpen,
            collapsed,
            mobileId,
            toggleRef,
            focusableMobileList,
            focusTrap,
        } = useNavbarContext();

        if (!collapsed) {
            return null;
        }

        return (
            <Button
                as="button"
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !mobileOpen) {
                        e.preventDefault();

                        setMobileOpen(true);

                        if (focusTrap) {
                            requestAnimationFrame(() => {
                                focusableMobileList.focusFirst(true);
                            });
                        }

                        return;
                    }

                    if (!mobileOpen) {
                        return;
                    }

                    switch (e.key) {
                        case 'ArrowDown': {
                            e.preventDefault();

                            focusableMobileList.focusFirst(true);

                            break;
                        }

                        case 'ArrowUp': {
                            e.preventDefault();

                            focusableMobileList.focusLast(true);

                            break;
                        }

                        case 'Home': {
                            e.preventDefault();

                            focusableMobileList.focusFirst(true);

                            break;
                        }

                        case 'End': {
                            e.preventDefault();

                            focusableMobileList.focusLast(true);

                            break;
                        }
                    }
                }}
                iconOnly
                intent="secondary"
                active={mobileOpen}
                ref={mergeRefs(toggleRef, ref)}
                className={clsx(prefix('__toggle'), className)}
                type="button"
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
                aria-controls={mobileId}
                onPointerDown={() => setMobileOpen((prev) => !prev)}
                data-mobile-opened={mobileOpen}
                {...rest}
            >
                {children ?? <BurgerIcon />}
            </Button>
        );
    },
);

// -----------------------------------------------------------------------------
// Mobile
// -----------------------------------------------------------------------------

const NavbarMobile = forwardRef<HTMLDivElement, NavbarMobileProps>(
    (
        {
            children,
            className,
            collapseProps,

            ...rest
        },
        ref,
    ) => {
        const {
            mobileOpen,
            collapsed,
            mobileId,
            setMobileOpen,
            rootRef,
            toggleRef,
            focusTrap,
            closeOnEscape,
            closeOnFocusOutside,
            closeOnPointerOutside,
            nestedLayers,
        } = useNavbarContext();

        const { isInsideNestedLayer } = nestedLayers;

        const [trapActive, setTrapActive] = useState(false);

        const containerRef = useRef<HTMLDivElement | null>(null);

        usePointerOutside({
            active: mobileOpen && closeOnPointerOutside && false,
            containerRef: rootRef,
            excludeRefs: [toggleRef],
            onPointerOutside: (event) => {
                const target = event.target as Node;

                if (isInsideNestedLayer(target)) {
                    return;
                }

                setMobileOpen(false);
            },
        });

        useRestoreFocus({
            active: mobileOpen,
            containerRef,
        });

        useEscapeKey({
            active: mobileOpen && closeOnEscape,
            containerRef: rootRef,
            onEscape: () => {
                setMobileOpen(false);
            },
        });

        useFocusTrap({
            active: focusTrap && collapsed && trapActive,
            containerRef,
        });

        useFocusOutside({
            active: mobileOpen && !focusTrap && closeOnFocusOutside,

            containerRef: rootRef,

            onOutsideFocus: (event) => {
                requestAnimationFrame(() => {
                    const activeElement = document.activeElement;

                    if (!(activeElement instanceof HTMLElement)) {
                        return;
                    }

                    const isInsideContainer = containerRef.current?.contains(activeElement);

                    if (isInsideContainer) {
                        return;
                    }

                    if (isInsideNestedLayer(activeElement)) {
                        return;
                    }

                    setMobileOpen(false);
                });
            },
        });

        if (!collapsed) {
            return null;
        }

        return (
            <NavbarMobileContext.Provider
                value={{
                    insideMobile: true,
                }}
            >
                <Collapse
                    {...collapseProps}
                    open={mobileOpen}
                    onEntered={() => {
                        setTrapActive(true);
                        collapseProps?.onEntered?.();
                    }}
                    onExited={() => {
                        setTrapActive(false);
                        collapseProps?.onExited?.();
                    }}
                >
                    <Box
                        ref={mergeRefs(ref, containerRef)}
                        id={mobileId}
                        className={clsx(prefix('__mobile'), className)}
                        gap={2}
                        // padding={4}
                        {...rest}
                    >
                        {children}
                    </Box>
                </Collapse>
            </NavbarMobileContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Compound export
// -----------------------------------------------------------------------------

export const Navbar = NavbarRoot as NavbarCompound;

Navbar.Brand = NavbarBrand;
Navbar.Header = NavbarHeader;
Navbar.Content = NavbarContent;
Navbar.Items = NavbarItems;
Navbar.Item = NavbarItem;
Navbar.Toggle = NavbarToggle;
Navbar.Mobile = NavbarMobile;
