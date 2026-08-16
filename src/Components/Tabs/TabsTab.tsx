import clsx from 'clsx';
import { ReactNode, useRef, useEffect, ComponentProps } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix } from './Tabs';
import { Box, BoxProps } from '../Box';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

type TabsTabProps = {
  value: string;
  // children: ReactNode;
} & BoxProps &
  ComponentProps<'button'>;

//----------------------------------------------------------------------
// Tabs
//----------------------------------------------------------------------

function TabsTab({
  value,
  children,
  className,
  type = 'button',
  onClick,
  px = 3,
  py = 2,

  ...rest
}: TabsTabProps) {
  const context = useTabsContext();

  const active = context.value === value;

  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    context.registerTab(value, ref.current);
  }, [context, value]);

  return (
    <Box
      {...rest}
      as="button"
      ref={ref}
      type={type}
      onClick={(e) => {
        onClick?.(e);
        context.onChange(value);
      }}
      px={px}
      py={py}
      className={clsx(prefix('__tab'), className)}
      data-active={active || undefined}
    >
      {children}
    </Box>
  );
}

export { TabsTab };
