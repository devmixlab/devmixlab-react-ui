import clsx from 'clsx';
import { ReactNode, useRef, useEffect, ComponentProps } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix, TabsSize } from './Tabs';
import { Box, BoxProps } from '../Box';
import { TabsIconPlacement } from './Tabs';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

type TabsTabProps = {
  value: string;
  icon?: ReactNode;
  iconPlacement?: TabsIconPlacement;
  size?: TabsSize;
  // children: ReactNode;
} & Omit<BoxProps, 'size'> &
  ComponentProps<'button'>;

type SizeMap = {
  py: number;
  px: number;
  fs: string;
};

//----------------------------------------------------------------------
// sizesMap
//----------------------------------------------------------------------

const sizesMap: Record<TabsSize, SizeMap> = {
  xs: {
    px: 1,
    py: 1,
    fs: '12px',
  },
  sm: {
    px: 2,
    py: 1,
    fs: '13px',
  },
  md: {
    px: 3,
    py: 2,
    fs: '14px',
  },
  lg: {
    px: 4,
    py: 3,
    fs: '16px',
  },
  xl: {
    px: 5,
    py: 4,
    fs: '18px',
  },
} as const;

//----------------------------------------------------------------------
// Tabs
//----------------------------------------------------------------------

function TabsTab({
  value,
  children,
  className,
  type = 'button',
  onClick,
  px: pxProp,
  py: pyProp,
  fs: fsProp,
  grow,
  size: sizeProp,

  ...rest
}: TabsTabProps) {
  const {
    size: ctxSize,
    value: ctxValue,
    registerTab,
    onChange,
    equalWidthTabs,
    intent,
    variant,
  } = useTabsContext();

  const active = ctxValue === value;
  const size = sizeProp ?? ctxSize ?? 'md';

  const sizes = sizesMap[size];

  const px = pxProp ?? sizes.px;
  const py = pyProp ?? sizes.py;
  const fs = fsProp ?? sizes.fs;

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    registerTab(value, ref.current);
  }, [registerTab, value]);

  return (
    <Box
      {...rest}
      as="button"
      ref={ref}
      type={type}
      onClick={(e) => {
        onClick?.(e);
        onChange(value);
      }}
      px={px}
      py={py}
      fs={fs}
      cursor="pointer"
      grow={grow ?? (equalWidthTabs || undefined)}
      className={clsx(prefix('__tab'), className)}
      data-active={active || undefined}
      data-size={size}
      data-intent={intent}
      data-variant={variant}
    >
      {children}
    </Box>
  );
}

export { TabsTab };
