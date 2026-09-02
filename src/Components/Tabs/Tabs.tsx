import { ComponentProps, ReactNode, useCallback, useRef, useState } from 'react';
import { TabsContext } from './TabsContext';
import { TabsList } from './TabsList';
import { TabsTab } from './TabsTab';
import { TabsScrollable } from './TabsScrollable';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';
// import { useFocusTrap } from '../../hooks';
import { FocusableItem, useFocusableList } from '../../hooks/useFocusableList';
import { FocusScope } from '../Navbar/Navbar.types';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

type TabsComponent = {
  <TValue extends string = string>(props: TabsProps<TValue>): React.ReactElement | null;

  List: typeof TabsList;
  Tab: typeof TabsTab;
  Scrollable: typeof TabsScrollable;
};

type TabsIconPlacement = 'top' | 'bottom' | 'start' | 'end';
type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TabsOrientation = 'horizontal' | 'vertical';

type TabsProps<TValue extends string = string> = {
  value?: TValue;
  defaultValue?: TValue;
  onValueChange?: (value: TValue) => void;

  fullWidth?: boolean;
  equalWidthTabs?: boolean;
  iconPlacement?: TabsIconPlacement;
  size?: TabsSize;
  orientation?: TabsOrientation;
  intent?: string;
  variant?: string;
} & ComponentProps<'div'>;

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

export const prefix = (name: string = '') => classPrefix(`--tabs${name}`);

//----------------------------------------------------------------------
// Tabs
//----------------------------------------------------------------------

const Tabs = (<TValue extends string = string>({
  intent,
  variant,
  fullWidth = false,
  equalWidthTabs = false,
  size = 'md',
  orientation = 'horizontal',
  className,
  children,
  value,
  defaultValue,
  onValueChange,
  iconPlacement,
}: TabsProps<TValue>) => {
  const [focusableItems, setfocusableItems] = useState<Map<string, FocusableItem>>(new Map([]));

  const [scrollable, setScrollable] = useState(false);

  const focusableList = useFocusableList([...focusableItems.values()]);

  // console.log('focusableItems', focusableItems);

  const controlled = value !== undefined;

  // const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [internalValue, setInternalValue] = useState<string>((defaultValue ?? '') as string);

  // const activeValue = controlled ? value : internalValue;
  const activeValue = controlled ? (value as string) : internalValue;

  const handleChange = (nextValue: string) => {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue as TValue);
  };

  const tabs = useRef(new Map<string, HTMLButtonElement>());

  const registerTab = useCallback(
    (value: string, element: HTMLButtonElement | null, disabled = false) => {
      if (element) {
        tabs.current.set(value, element);
        setfocusableItems((prev) => {
          const next = new Map(prev);
          next.set(value, { id: value, disabled });
          return next;
        });
      } else {
        tabs.current.delete(value);
        setfocusableItems((prev) => {
          const next = new Map(prev);
          next.delete(value);
          return next;
        });
      }
    },
    [],
  );

  // useFocusTrap({ active: true,  });

  return (
    <TabsContext.Provider
      value={{
        scrollable,
        setScrollable,
        orientation,
        focusableList,
        intent,
        variant,
        size,
        fullWidth,
        equalWidthTabs,
        value: activeValue,
        onValueChange: handleChange,
        registerTab,
        tabs: tabs.current,
        iconPlacement,
      }}
    >
      <div
        className={clsx(prefix(), className)}
        data-intent={intent}
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}) as TabsComponent;

Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Scrollable = TabsScrollable;

//------------------------------------------------------
// Export
//------------------------------------------------------

export { Tabs };

export type { TabsIconPlacement, TabsSize, TabsOrientation };
