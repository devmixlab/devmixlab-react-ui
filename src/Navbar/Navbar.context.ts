import React from 'react';

type NavbarContextValue = {
    mobileOpen: boolean;
    setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;

    itemRefs: React.MutableRefObject<Map<string, HTMLElement | null>>;

    registerItem: (id: string, node: HTMLElement | null) => void;

    unregisterItem: (id: string) => void;
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
