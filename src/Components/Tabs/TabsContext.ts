import { createContext, useContext } from 'react';
import { TabsIconPlacement, TabsSize } from './Tabs';

export type TabsContextValue = {
  fullWidth: boolean;
  equalWidthTabs?: boolean;
  iconPlacement?: TabsIconPlacement;
  size?: TabsSize;

  intent?: string;
  variant?: string;

  value: string;
  onChange: (value: string) => void;

  registerTab: (value: string, element: HTMLButtonElement | null) => void;

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
