import React, { createContext, useContext } from 'react';
import { FocusableItem, FocusableListResult } from '../hooks/useFocusableList';

// -----------------------------------------------------------------------------
// NavbarContext
// -----------------------------------------------------------------------------

type NavbarContextValue = {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;

    rootRef: React.MutableRefObject<HTMLDivElement | null>;

    mobileId: string;

    focusableList: FocusableListResult;
    registerItem: (item: FocusableItem) => void;
    unregisterItem: (id: string) => void;

    collapsed: boolean;
    closeOnSelect: boolean;
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
