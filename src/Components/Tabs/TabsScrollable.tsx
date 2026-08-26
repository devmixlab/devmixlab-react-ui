import { ReactNode, ComponentProps, useRef, useState, useEffect } from 'react';
import { prefix as tabsPrefix } from './Tabs';
import { Button } from '../Button';
import { ChevronLeft, ChevronRight } from '../Icon';
import { useTabsContext } from './TabsContext';

type TabsScrollableProps = {
  children: ReactNode;
} & ComponentProps<'div'>;

const prefix = (p?: string = '') => {
  return tabsPrefix(`__scrollable${p}`);
};

export function TabsScrollable({ children, ...rest }: TabsScrollableProps) {
  const { value, tabs } = useTabsContext();

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
    const container = viewportRef.current;
    const activeTab = tabs.get(value);

    if (!container || !activeTab) {
      return;
    }

    container.scrollLeft =
      activeTab.offsetLeft - container.clientWidth / 2 + activeTab.clientWidth / 2;
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

  return (
    <div {...rest} className={prefix()} data-scrolls={canScrollRight || canScrollLeft || undefined}>
      {/*{canScrollLeft && <div className={`${prefix('__shadow')} ${prefix('__shadow--left')}`} />}*/}

      {/*{canScrollRight && <div className={`${prefix('__shadow')} ${prefix('__shadow--right')}`} />}*/}

      {/*{canScrollLeft && (*/}
      {/*  <Button type="button" onClick={() => scroll('left')} className={`${prefix('__prev')}`}>*/}
      {/*    ←*/}
      {/*  </Button>*/}
      {/*)}*/}

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

      <div ref={viewportRef} className={prefix('__viewport')}>
        {children}
      </div>

      {/*{canScrollRight && (*/}
      {/*  <Button type="button" onClick={() => scroll('right')} className={`${prefix('__next')}`}>*/}
      {/*    →*/}
      {/*  </Button>*/}
      {/*)}*/}

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
    </div>
  );
}
