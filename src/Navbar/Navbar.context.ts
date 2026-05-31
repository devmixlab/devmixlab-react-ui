import React, { createContext, useContext } from 'react';
import { FocusableItem, FocusableListResult } from '../hooks/useFocusableList';
import { FocusScope } from './Navbar.types';
import { NestedLayersHook } from '../hooks/useNestedLayers';

// -----------------------------------------------------------------------------
// NavbarContext
// -----------------------------------------------------------------------------

type NavbarContextValue = {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;

    rootRef: React.MutableRefObject<HTMLDivElement | null>;
    toggleRef: React.MutableRefObject<HTMLButtonElement | null>;

    mobileId: string;

    focusableList: FocusableListResult;
    focusableMobileList: FocusableListResult;
    registerItem: (item: FocusableItem, scope: FocusScope) => void;
    unregisterItem: (id: string, scope: FocusScope) => void;

    collapsed: boolean;
    closeOnSelect: boolean;

    focusTrap: boolean;
    closeOnEscape: boolean;
    closeOnFocusOutside: boolean;
    closeOnPointerOutside: boolean;

    nestedLayers: NestedLayersHook;

    // registerNestedLayer: (node: HTMLElement) => void;
    // unregisterNestedLayer: (node: HTMLElement) => void;
    // nestedLayersRef: React.RefObject<Set<HTMLElement>>;
};

const NavbarContext = createContext<NavbarContextValue | null>(null);

const useNavbarContext = () => {
    const ctx = useContext(NavbarContext);

    if (!ctx) {
        throw new Error('Navbar components must be used inside <Navbar>');
    }

    return ctx;
};

export { NavbarContext, useNavbarContext };
export type { NavbarContextValue };

// -----------------------------------------------------------------------------
// NavbarMobileContext
// -----------------------------------------------------------------------------

type NavbarMobileContextValue = {
    insideMobile: boolean;
};

const NavbarMobileContext = createContext<NavbarMobileContextValue>({
    insideMobile: false,
});

const useNavbarMobileContext = () => {
    return useContext(NavbarMobileContext);
};

export { NavbarMobileContext, useNavbarMobileContext };
export type { NavbarMobileContextValue };
