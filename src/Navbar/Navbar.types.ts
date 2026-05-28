import React from 'react';
import { BoxComponentProps } from '../Box/Box';
import { Breakpoint } from '../utils/responsive';
import { CollapseProps } from '../Collapse/Collapse';

export type Variant = 'base' | 'subtle' | 'solid' | 'outlined' | 'transparent';

export type NavbarProps<C extends React.ElementType = 'nav'> = BoxComponentProps<
    C,
    {
        sticky?: boolean;
        bordered?: boolean;
        elevated?: boolean;
        centered?: boolean;
        collapseBreakpoint?: Breakpoint;
        closeOnSelect?: boolean;
        backdrop?: boolean;

        focusTrap?: boolean;
        closeOnEscape?: boolean;
        closeOnFocusOutside?: boolean;
        closeOnPointerOutside?: boolean;
    }
>;

export type NavbarBrandProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

export type NavbarHeaderProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

export type NavbarContentProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

export type NavbarItemsProps<C extends React.ElementType = 'div'> = BoxComponentProps<C>;

// export type NavbarItemRenderProps = {
//     disabled: boolean;
//     active: boolean;
//     focusedVisible: boolean;
//     pressed: boolean;
//     register: (node: HTMLElement | null) => void;
//     registerNestedLayer: (node: HTMLElement) => void;
// };

export type NavbarItemRenderProps = {
    /**
     * Whether the item interaction is disabled.
     */
    disabled: boolean;

    /**
     * Whether the item represents the current active route/state.
     */
    active: boolean;

    /**
     * Whether the item currently has keyboard-visible focus.
     */
    focusedVisible: boolean;

    /**
     * Whether the item is currently being pressed/clicked.
     */
    pressed: boolean;

    /**
     * Ref callback used to register the trigger element
     * into the navbar roving focus / keyboard navigation system.
     */
    focusableRef: (node: HTMLElement | null) => void;

    /**
     * Ref callback used to register portaled overlays
     * (popover panels, dropdown menus, submenus, etc.)
     * as logically inside the navbar interaction tree.
     */
    nestedLayerRef: (node: HTMLElement | null) => void;
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

export type NavbarMobileProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        collapseProps: Omit<CollapseProps, 'open'>;
        focusTrap?: boolean;
        closeOnEscape?: boolean;
        closeOnFocusOutside?: boolean;
        closeOnPointerOutside?: boolean;
    }
>;
