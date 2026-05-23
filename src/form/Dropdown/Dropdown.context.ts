import React, { createContext, useContext } from 'react';
import { DropdownOptionProps, DropdownOptionData, OnReadyCallbackProps } from './Dropdown';
import { FocusableListResult } from '../../hooks/useFocusableList';

// import { useFloatingLayer } from '../hooks';
// import { PresenceState } from '../hooks/usePresence';
// import { PopoverRole } from './Popover';

type DropdownContextValue = {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;

    triggerRef: React.RefObject<HTMLElement>;

    handleSelect: (nextValue: string) => void;

    focusByTypeahead: (key: string) => void;

    isOptionShown: (option: DropdownOptionData) => boolean;

    disabled: boolean;
    invalid: boolean;

    optionPressed: number | null;
    setOptionPressed: React.Dispatch<React.SetStateAction<number | null>>;

    isSearchable: boolean;
    setIsSearchable: React.Dispatch<React.SetStateAction<boolean>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    searchInputRef: React.RefObject<HTMLInputElement>;

    focusableList: FocusableListResult;

    selectedOption?: DropdownOptionData;
    selectedValue?: string;

    options: DropdownOptionData[];
    filteredOptions: DropdownOptionData[];

    registerOption: (option: DropdownOptionData) => void;
    unregisterOption: (id: string) => void;

    runAfterReady: (callback: () => void) => void;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
    const ctx = useContext(DropdownContext);

    if (!ctx) {
        throw new Error('Dropdown components must be used inside <Dropdown />');
    }

    return ctx;
};

export { DropdownContext, useDropdownContext };

export type { DropdownContextValue };
