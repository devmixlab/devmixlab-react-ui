import {useCallback, useEffect, useMemo, useState} from 'react';

export type UseScrollSpyOptions = {
  ids: readonly string[];
  activeOffset?: number;
  scrollOffset?: number;
  behavior?: ScrollBehavior;
};

export type UseScrollSpyReturn<T extends string> = {
  activeId: T | null;
  isActive: (id: T) => boolean;
  scrollToId: (id: T) => void;
};

export const useScrollSpy = <T extends string>({
                                                 ids,
                                                 activeOffset = 120,
                                                 scrollOffset = 0,
                                                 behavior = 'smooth',
                                               }: UseScrollSpyOptions): UseScrollSpyReturn<T> => {
  const [activeId, setActiveId] = useState<T | null>(null);

  useEffect(() => {
    const elements = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null);

    if (!elements.length) {
      return;
    }

    const update = () => {
      let current: HTMLElement | null = null;

      for (let i = elements.length - 1; i >= 0; i--) {
        if (elements[i].getBoundingClientRect().top <= activeOffset) {
          current = elements[i];
          break;
        }
      }

      const next = current ? (current.id as T) : null;

      setActiveId(prev => (prev === next ? prev : next));
    };

    let ticking = false;
    let frame = 0;

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;

      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    // elements.forEach((element) => observer.observe(element));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids, activeOffset]);

  const isActive = useCallback(
      (id: T) => activeId === id,
      [activeId],
  );

  const scrollToId = useCallback(
      (id: T) => {
        const element = document.getElementById(id);
        if (element) {
          const top =
              element.getBoundingClientRect().top +
              window.scrollY -
              scrollOffset;

          window.scrollTo({
            top,
            // top: element.offsetTop - scrollOffset,
            behavior,
          });
        }
        // document.getElementById(id)?.scrollIntoView({
        //   behavior,
        //   block: 'start',
        // });
      },
      [behavior],
  );

  return useMemo(
      () => ({
        activeId,
        isActive,
        scrollToId,
      }),
      [activeId, isActive, scrollToId],
  );
};