import { ReactNode, useState, useEffect, ComponentProps, useRef } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix } from './Tabs';
import clsx from 'clsx';
import { BoxDerived, BoxDerivedProps } from '../Box';

//-----------------------------------
// Types
//-----------------------------------

type TabsListProps = {
  children: ReactNode;
  indicatorProps?: BoxDerivedProps & ComponentProps<'div'>;
} & BoxDerivedProps &
  ComponentProps<'div'>;

//-----------------------------------
// TabsList
//-----------------------------------

function TabsList({ children, className, indicatorProps, ...rest }: TabsListProps) {
  const { tabs, value: activeValue } = useTabsContext();

  const listRef = useRef<HTMLDivElement>(null);

  const [resizing, setResizing] = useState(false);

  const [initialized, setInitialized] = useState(false);

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
  });

  //-----------------------------------
  // Window resize state
  //-----------------------------------

  useEffect(() => {
    let timeout: number;

    const handleResize = () => {
      setResizing(true);

      clearTimeout(timeout);

      timeout = window.setTimeout(() => {
        setResizing(false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  //-----------------------------------
  // Indicator position
  //-----------------------------------

  useEffect(() => {
    const updateIndicator = () => {
      const element = tabs.get(activeValue);

      if (!element) {
        return;
      }

      setIndicator({
        left: element.offsetLeft,
        width: element.offsetWidth,
      });

      requestAnimationFrame(() => {
        setInitialized(true);
      });
    };

    updateIndicator();

    const activeTab = tabs.get(activeValue);

    const observer = new ResizeObserver(updateIndicator);

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    if (activeTab) {
      observer.observe(activeTab);
    }

    return () => {
      observer.disconnect();
    };
  }, [tabs, activeValue]);

  //-----------------------------------
  // Indicator props
  //-----------------------------------

  const indicatorOptions = indicatorProps ?? {};

  const finalIndicatorProps = {
    ...indicatorOptions,
    className: clsx(prefix('__indicator'), indicatorOptions.className),
    ...(resizing ? { 'data-resizing': true } : {}),
    ...(initialized ? { 'data-initialized': true } : {}),
    style: {
      ...indicatorOptions.style,
      left: indicator.left,
      width: indicator.width,
      // ...((!initialized || resizing) && {
      //   transition: 'none',
      // }),
    },
  };

  //-----------------------------------
  // Render
  //-----------------------------------

  return (
    <BoxDerived
      ref={listRef}
      className={clsx(prefix('__list'), className)}
      data-resizing={resizing || undefined}
      data-initialized={initialized || undefined}
    >
      <BoxDerived {...rest} className={clsx(prefix('__track'), className)}>
        {children}
      </BoxDerived>
      <BoxDerived {...finalIndicatorProps} />
    </BoxDerived>
  );
}

export { TabsList };
