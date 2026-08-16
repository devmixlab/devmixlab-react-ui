import { ReactNode, useState, useEffect, ComponentProps } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix } from './Tabs';
import clsx from 'clsx';
import { Box, BoxProps } from '../Box';

//-----------------------------------
// Types
//-----------------------------------

type TabsListProps = {
  children: ReactNode;
  indicatorProps?: BoxProps & ComponentProps<'div'>;
} & BoxProps &
  ComponentProps<'div'>;

//-----------------------------------
// TabsList
//-----------------------------------

function TabsList({
  children,
  className,
  borderBottomWidth = '1px',
  borderBottomStyle = 'solid',
  borderBottomColor = '#ccc',
  position = 'relative',
  display = 'inline-flex',
  gap = 1,

  indicatorProps,

  ...rest
}: TabsListProps) {
  const { tabs, value: activeValue } = useTabsContext();

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
    position: indicatorOptions.position ?? 'absolute',
    bottom: indicatorOptions.bottom ?? 0,
    h: indicatorOptions.h ?? 2,
    rounded: indicatorOptions.rounded ?? 'full',
    bg: indicatorOptions.bg ?? '#ccc',
    transition: indicatorOptions.transition ?? 'all .3s ease',
    className: clsx(prefix('__indicator'), indicatorOptions.className ?? ''),
    style: {
      ...indicatorOptions.style,
      left: indicator.left,
      width: indicator.width,
    },
  };

  return (
    <Box
      {...rest}
      borderBottomWidth={borderBottomWidth}
      borderBottomStyle={borderBottomStyle}
      borderBottomColor={borderBottomColor}
      position={position}
      display={display}
      gap={gap}
      className={clsx(prefix('__list'), className)}
    >
      {children}

      <Box {...finalIndicatorProps} />
    </Box>
  );
}

export { TabsList };
