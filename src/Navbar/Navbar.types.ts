import React from 'react';
import { BoxComponentProps } from '../Components/Box/Box';
import { Breakpoint } from '../utils/responsive';
import { CollapseProps } from '../Collapse/Collapse';
import { ButtonProps } from '../Components/Button/Button';

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

export type FocusScope = 'desktop' | 'mobile';

export type NavbarItemElementProps<T extends HTMLElement = HTMLElement> = {
    ref?: React.Ref<T>;

    onClick?: React.MouseEventHandler<T>;
    onKeyDown?: React.KeyboardEventHandler<T>;
    onFocus?: React.FocusEventHandler<T>;

    'aria-current'?: 'page';
    'data-active'?: boolean;
};

export type NavbarItemRenderProps = {
    /**
     * Whether the item interaction is disabled.
     */
    disabled: boolean;

    /**
     * Whether the item represents the current active route/state.
     */
    active: boolean;

    itemProps: NavbarItemElementProps;

    className: string;

    /**
     * Whether the item currently has keyboard-visible focus.
     */
    // focusedVisible: boolean;

    /**
     * Whether the item is currently being pressed/clicked.
     */
    // pressed: boolean;

    /**
     * Ref callback used to register the trigger element
     * into the navbar roving focus / keyboard navigation system.
     */
    // focusableRef: (node: HTMLElement | null) => void;

    /**
     * Creates a ref callback that registers a floating layer
     * (popover, dropdown, menu, etc.) as part of the navbar.
     *
     * Use a separate ref instance for each floating layer:
     *
     * ```tsx
     * const panelRef = createNestedLayerRef();
     * const nestedPanelRef = createNestedLayerRef();
     *
     * <Popover.Panel ref={panelRef}>
     *     <Popover.Panel ref={nestedPanelRef} />
     * </Popover.Panel>
     * ```
     *
     * Registered layers are treated as part of the navbar when
     * handling focus-outside and pointer-outside interactions,
     * preventing the mobile menu from closing while interacting
     * with nested floating content.
     */
    createNestedLayerRef: () => (node: HTMLElement | null) => void;
};

// export type NavbarItemProps<C extends React.ElementType = 'button'> = BoxComponentProps<
//     C,
//     {
//         active?: boolean;
//         disabled?: boolean;
//         render?: (props: NavbarItemRenderProps) => React.ReactNode;
//     }
// >;

export type NavbarItemProps = {
    active?: boolean;
    render?: (props: NavbarItemRenderProps) => React.ReactNode;
} & ButtonProps;

export type NavbarToggleProps<C extends React.ElementType = 'button'> = BoxComponentProps<
    C,
    ButtonProps
>;

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
