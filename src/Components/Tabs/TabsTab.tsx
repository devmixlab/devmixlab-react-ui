import clsx from 'clsx';
import React, { ReactNode, useRef, useEffect, ComponentProps, forwardRef } from 'react';
import { useTabsContext } from './TabsContext';
import { prefix, TabsSize } from './Tabs';
import { Box, BoxProps } from '../Box';
import { TabsIconPlacement } from './Tabs';
import { mergeRefs, useStableId } from '../../utils';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

type TabsTabProps = {
  value: string;
  icon?: ReactNode;
  iconPlacement?: TabsIconPlacement;
  // size?: TabsSize;
  disabled?: boolean;
  // children: ReactNode;
} & Omit<BoxProps, 'size'> &
  ComponentProps<'button'>;

//----------------------------------------------------------------------
// Tabs
//----------------------------------------------------------------------

const TabsTab = forwardRef<HTMLButtonElement, TabsTabProps>(
  (
    {
      value,
      children,
      className,
      type = 'button',
      onClick,
      grow,
      disabled,
      onKeyDown,

      icon,
      iconPlacement: propIconPlacement,

      ...rest
    },
    ref,
  ) => {
    const {
      orientation,
      size,
      value: ctxValue,
      registerTab,
      onChange,
      equalWidthTabs,
      intent,
      variant,
      focusableList,
      iconPlacement: ctxIconPlacement,
    } = useTabsContext();

    const iconPlacement = propIconPlacement ?? ctxIconPlacement ?? 'start';

    const isVertical = orientation === 'vertical';

    console.log('isVertical', isVertical);

    const { focusNext, focusFirst, focusLast, setFocusedId, setRef, isFocusableElement } =
      focusableList;

    const innerRef = useRef<HTMLButtonElement>(null);

    const combinedRef = mergeRefs(innerRef, ref, setRef(value));

    const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight'];

    const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft'];

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (nextKeys.includes(e.key)) {
        console.log('nextKeys', nextKeys);
        e.preventDefault();
        focusNext(1);
        return;
      }

      if (prevKeys.includes(e.key)) {
        e.preventDefault();
        focusNext(-1);
        return;
      }

      switch (e.key) {
        case 'Home':
          e.preventDefault();
          focusFirst();
          break;

        case 'End':
          e.preventDefault();
          focusLast();
          break;
      }
    };

    const active = ctxValue === value;

    useEffect(() => {
      registerTab(value, innerRef.current, disabled ?? false);
    }, [registerTab, value]);

    return (
      <Box
        {...rest}
        as="button"
        ref={combinedRef}
        type={type}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(e);
          onChange(value);
        }}
        onFocus={() => {
          setFocusedId(value);
        }}
        onKeyDown={(e: React.KeyboardEvent<Element>) => {
          if (disabled) {
            return;
          }

          const target = e.target;

          if (!(target instanceof Node)) {
            return;
          }

          if (!isFocusableElement(target)) {
            return;
          }

          handleKeyDown(e);

          onKeyDown?.(e as React.KeyboardEvent<HTMLButtonElement>);
        }}
        grow={grow ?? (equalWidthTabs || undefined)}
        className={clsx(prefix('__tab'), className)}
        data-active={active || undefined}
        data-size={size}
        data-intent={intent}
        data-variant={variant}
        data-disabled={disabled}
        data-value={value}
        data-icon-placement={iconPlacement}
      >
        {/* START TOP ICON */}
        {icon && (iconPlacement === 'top' || iconPlacement === 'start') && (
          <span className={prefix(`__icon`)}>{icon}</span>
        )}

        <span className={prefix(`__content`)}>{children}</span>

        {/* END BOTTOM ICON */}
        {icon && (iconPlacement === 'bottom' || iconPlacement === 'end') && (
          <span className={prefix(`__icon`)}>{icon}</span>
        )}
      </Box>
    );
  },
);

export { TabsTab };
