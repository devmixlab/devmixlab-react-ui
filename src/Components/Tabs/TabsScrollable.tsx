import { ReactNode, ComponentProps, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { prefix as tabsPrefix } from './Tabs';
import { Button } from '../Button';
import { ChevronLeft, ChevronRight } from '../Icon';
import { useTabsContext } from './TabsContext';
import { Box, BoxProps } from '../Box';

type TabsScrollableProps = {
  children: ReactNode;
  viewPortProps?: BoxProps;
} & BoxProps &
  ComponentProps<'div'>;

const prefix = (p: string = '') => {
  return tabsPrefix(`__scrollable${p}`);
};

export function TabsScrollable({
  children,
  viewPortProps: viewPortPropsProp,
  width: widthProp,
  display: displayProp,
  gap = 2,
  ...rest
}: TabsScrollableProps) {
  const { value, tabs, fullWidth } = useTabsContext();

  const width = widthProp ?? (fullWidth ? 'full' : 'auto');
  const display = displayProp ?? (fullWidth ? 'flex' : 'inline-flex');

  const activeTab = tabs.get(value);

  const viewportRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = () => {
    const el = viewportRef.current;

    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 0);

    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const container = viewportRef.current;
      const activeTab = tabs.get(value);

      if (!container || !activeTab) {
        return;
      }

      container.scrollLeft =
        activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;
    });

    return () => cancelAnimationFrame(id);
  }, [value, tabs]);

  useEffect(() => {
    const el = viewportRef.current;

    if (!el) {
      return;
    }

    updateButtons();

    el.addEventListener('scroll', updateButtons);

    const observer = new ResizeObserver(updateButtons);

    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', updateButtons);
      observer.disconnect();
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = viewportRef.current;

    if (!el) {
      return;
    }

    el.scrollBy({
      left: direction === 'left' ? -el.clientWidth * 0.75 : el.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  const viewPortProps = { pb: 1, pt: 1, ...viewPortPropsProp };

  return (
    <Box
      {...rest}
      width={width}
      display={display}
      gap={gap}
      className={prefix()}
      data-scrolls={canScrollRight || canScrollLeft || undefined}
    >
      {/*{canScrollLeft && <div className={`${prefix('__shadow')} ${prefix('__shadow--left')}`} />}*/}

      {/*{canScrollRight && <div className={`${prefix('__shadow')} ${prefix('__shadow--right')}`} />}*/}

      {/*{canScrollLeft && (*/}
      {/*  <Button type="button" onClick={() => scroll('left')} className={`${prefix('__prev')}`}>*/}
      {/*    ←*/}
      {/*  </Button>*/}
      {/*)}*/}

      {(canScrollLeft || canScrollRight) && (
        <Button
          disabled={!canScrollLeft}
          type="button"
          onClick={() => scroll('left')}
          className={`${prefix('__prev')}`}
          style={{ paddingLeft: 0, paddingRight: 0 }}
          intent="secondary"
          data-visible={canScrollRight || canScrollLeft}
        >
          <ChevronLeft />
        </Button>
      )}

      <Box {...viewPortProps} ref={viewportRef} className={prefix('__viewport')}>
        {children}
      </Box>

      {/*{canScrollRight && (*/}
      {/*  <Button type="button" onClick={() => scroll('right')} className={`${prefix('__next')}`}>*/}
      {/*    →*/}
      {/*  </Button>*/}
      {/*)}*/}

      {(canScrollLeft || canScrollRight) && (
        <Button
          disabled={!canScrollRight}
          type="button"
          onClick={() => scroll('right')}
          className={`${prefix('__next')}`}
          style={{ paddingLeft: 0, paddingRight: 0 }}
          rounded="sm"
          intent="secondary"
          data-visible={canScrollRight || canScrollLeft}
        >
          <ChevronRight />
        </Button>
      )}
    </Box>
  );
}
