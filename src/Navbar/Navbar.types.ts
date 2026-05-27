import React from 'react';
import { BoxComponentProps } from '../Box/Box';

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

export type NavbarItemRenderProps = {
    disabled: boolean;
    active: boolean;
    focusedVisible: boolean;
    pressed: boolean;
    register: (node: HTMLElement | null) => void;
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
