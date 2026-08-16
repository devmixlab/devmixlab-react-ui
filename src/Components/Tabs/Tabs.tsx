import { ComponentProps, ReactNode, useCallback, useRef, useState } from 'react';
import { TabsContext } from './TabsContext';
import { TabsList } from './TabsList';
import { TabsTab } from './TabsTab';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';
// import { useFocusTrap } from '../../hooks';
import { FocusableItem, useFocusableList } from '../../hooks/useFocusableList';
import { FocusScope } from '../Navbar/Navbar.types';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

type TabsComponent = React.FC<TabsProps> & {
  List: typeof TabsList;
  Tab: typeof TabsTab;
};

type TabsIconPlacement = 'top' | 'bottom' | 'start' | 'end';
type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type TabsOrientation = 'horizontal' | 'vertical';

type TabsProps = {
  // children: ReactNode;
  fullWidth?: boolean;
  equalWidthTabs?: boolean;
  iconPlacement?: TabsIconPlacement;
  size?: TabsSize;
  orientation?: TabsOrientation;

  intent?: string;
  variant?: string;

  value?: string;
  defaultValue?: string;

  onChange?: (value: string) => void;
} & ComponentProps<'div'>;

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

export const prefix = (name: string = '') => classPrefix(`--tabs${name}`);

//----------------------------------------------------------------------
// Tabs
//----------------------------------------------------------------------

const Tabs: TabsComponent = ({
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
  onChange,

  iconPlacement,
}: TabsProps) => {
  const [focusableItems, setfocusableItems] = useState<Map<string, FocusableItem>>(new Map([]));

  const focusableList = useFocusableList([...focusableItems.values()]);

  // console.log('focusableItems', focusableItems);

  const controlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(defaultValue ?? '');

  const activeValue = controlled ? value : internalValue;

  const handleChange = (nextValue: string) => {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
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
        orientation,
        focusableList,
        intent,
        variant,
        size,
        fullWidth,
        equalWidthTabs,
        value: activeValue,
        onChange: handleChange,
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
};

Tabs.List = TabsList;
Tabs.Tab = TabsTab;

//------------------------------------------------------
// Export
//------------------------------------------------------

export { Tabs };

export type { TabsIconPlacement, TabsSize, TabsOrientation };
