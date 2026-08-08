import React, { createContext, useContext, MutableRefObject } from 'react';
import {
  DropdownOptionProps,
  DropdownOptionData,
  OnReadyCallbackProps,
  OptionValue,
} from './Dropdown';
import { FocusableListResult } from '../../../hooks/useFocusableList';
import { GroupContextValue } from './Group.context';

// import { useFloatingLayer } from '../hooks';
// import { PresenceState } from '../hooks/usePresence';
// import { PopoverRole } from './Popover';

type DropdownContextValue<T extends string = string> = {
  modal: boolean;
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;

  returnFocusOnOptionPick: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;

  isPanelHovered: boolean;
  setIsPanelHovered: React.Dispatch<React.SetStateAction<boolean>>;

  handleSelect: (nextValue: OptionValue<T>) => void;

  focusByTypeahead: (key: string) => void;

  isOptionShown: (option: DropdownOptionData<T>) => boolean;
  isGroupShown: (group: GroupContextValue) => boolean;

  disabled: boolean;
  invalid: boolean;

  isSearchable: boolean;
  setIsSearchable: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;

  focusableList: FocusableListResult;

  selectedOption?: DropdownOptionData<T>;
  selectedValue?: OptionValue<T>;

  options: DropdownOptionData<T>[];
  filteredOptions: DropdownOptionData<T>[];

  registerOption: (option: DropdownOptionData<T>) => void;
  unregisterOption: (id: string) => void;

  runAfterReady: (callback: () => void) => void;
  runOnEntered: (callback: () => void) => void;

  stickyGroupLabels: boolean;
  openOnArrowKeys: boolean;

  invokeOnly: boolean;
};

const DropdownContext = createContext<DropdownContextValue<any> | null>(null);

const useDropdownContext = <T extends string = string>() => {
  const ctx = useContext(DropdownContext);

  if (!ctx) {
    throw new Error('Dropdown components must be used inside <Dropdown />');
  }

  return ctx as DropdownContextValue<T>;
};

export { DropdownContext, useDropdownContext };

export type { DropdownContextValue };
