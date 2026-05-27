import React from 'react';
import { FocusableItem, FocusableListResult } from '../hooks/useFocusableList';

type NavbarContextValue = {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;

    focusableList: FocusableListResult;
    registerItem: (item: FocusableItem) => void;
    unregisterItem: (id: string) => void;

    collapsed: boolean;
    closeOnSelect: boolean;
};

const NavbarContext = React.createContext<NavbarContextValue | null>(null);

const useNavbarContext = () => {
    const ctx = React.useContext(NavbarContext);

    if (!ctx) {
        throw new Error('Navbar components must be used inside <Navbar>');
    }

    return ctx;
};

export { NavbarContext, useNavbarContext };

export type { NavbarContextValue };
