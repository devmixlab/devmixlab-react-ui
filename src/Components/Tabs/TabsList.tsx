import { ReactNode, useState, useEffect, ComponentProps, useRef } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix } from './Tabs';
import clsx from 'clsx';
import { Box, BoxProps, BoxDerived, BoxDerivedProps } from '../Box';

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

function TabsList({
  children,
  className,

  indicatorProps,

  ...rest
}: TabsListProps) {
  const { tabs, value: activeValue, fullWidth } = useTabsContext();

  const listRef = useRef<HTMLDivElement>(null);

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const element = tabs.get(activeValue);

    if (!element) {
      return;
    }

    setIndicator({
      left: element.offsetLeft,
      width: element.offsetWidth,
    });
  }, [tabs, activeValue]);

  const indicatorOptions = indicatorProps ?? {};

  const finalIndicatorProps = {
    ...indicatorOptions,
    className: clsx(prefix('__indicator'), indicatorOptions.className ?? ''),
    style: {
      ...indicatorOptions.style,
      left: indicator.left,
      width: indicator.width,
    },
  };

  return (
    <BoxDerived ref={listRef} {...rest} className={clsx(prefix('__list'), className)}>
      {children}

      <BoxDerived {...finalIndicatorProps} />
    </BoxDerived>
  );
}

export { TabsList };
