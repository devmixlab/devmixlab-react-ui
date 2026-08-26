import { createContext, useContext, Dispatch, SetStateAction } from 'react';
import { TabsIconPlacement, TabsSize, TabsOrientation } from './Tabs';
import { FocusableItem, FocusableListResult } from '../../hooks/useFocusableList';

export type TabsContextValue = {
  scrollable: boolean;
  setScrollable: Dispatch<SetStateAction<boolean>>;

  fullWidth: boolean;
  equalWidthTabs?: boolean;
  iconPlacement?: TabsIconPlacement;
  size?: TabsSize;
  orientation: TabsOrientation;

  // registerItem: (item: FocusableItem) => void;
  // unregisterItem: (id: string) => void;
  focusableList: FocusableListResult;

  intent?: string;
  variant?: string;

  value: string;
  onValueChange: (value: string) => void;

  registerTab: (value: string, element: HTMLButtonElement | null, disabled: boolean) => void;

  tabs: Map<string, HTMLButtonElement>;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('Tabs components must be used inside Tabs');
  }

  return context;
}
