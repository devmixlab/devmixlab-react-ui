import React, { createContext, useContext, MutableRefObject } from 'react';
import { DropdownOptionData, OptionValueImpl } from './Dropdown';
import { FocusableListResult } from '../../../hooks/useFocusableList';
import { GroupContextValue } from './Group.context';

type DropdownContextValue = {
  modal: boolean;
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;

  returnFocusOnOptionPick: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;

  isPanelHovered: boolean;
  setIsPanelHovered: React.Dispatch<React.SetStateAction<boolean>>;

  handleSelect: (nextValue: OptionValueImpl) => void;

  focusByTypeahead: (key: string) => void;

  isOptionShown: (option: DropdownOptionData) => boolean;
  isGroupShown: (group: GroupContextValue) => boolean;

  disabled: boolean;
  invalid: boolean;

  isSearchable: boolean;
  setIsSearchable: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;

  focusableList: FocusableListResult;

  selectedOption?: DropdownOptionData;
  selectedValue?: OptionValueImpl;

  options: DropdownOptionData[];
  filteredOptions: DropdownOptionData[];

  registerOption: (option: DropdownOptionData) => void;
  unregisterOption: (id: string) => void;

  runAfterReady: (callback: () => void) => void;
  runOnEntered: (callback: () => void) => void;

  stickyGroupLabels: boolean;
  openOnArrowKeys: boolean;

  invokeOnly: boolean;

  nullable: boolean;
};

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = <T extends string | number = string>() => {
  const ctx = useContext(DropdownContext);

  if (!ctx) {
    throw new Error('Dropdown components must be used inside <Dropdown />');
  }

  return ctx as DropdownContextValue;
};

export { DropdownContext, useDropdownContext };

export type { DropdownContextValue };
