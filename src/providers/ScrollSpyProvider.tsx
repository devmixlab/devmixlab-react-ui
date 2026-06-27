import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

import {
  useScrollSpy,
  type UseScrollSpyReturn,
  type UseScrollSpyOptions
} from '../hooks';

type ScrollSpyContextValue = UseScrollSpyReturn<string>;

const ScrollSpyContext = createContext<ScrollSpyContextValue | null>(null);

type ScrollSpyProviderProps = PropsWithChildren<UseScrollSpyOptions>;

function ScrollSpyProvider({
                             children,
                             ids,
                             activeOffset = 120,
                             scrollOffset = 0,
                             behavior = 'smooth',
                           }: ScrollSpyProviderProps) {
  const value = useScrollSpy({
    ids,
    activeOffset,
    scrollOffset,
    behavior
  }) as ScrollSpyContextValue;

  return (
      <ScrollSpyContext.Provider value={value}>
        {children}
      </ScrollSpyContext.Provider>
  );
}

function useScrollSpyContext<T extends string = string>() {
  const context = useContext(ScrollSpyContext);

  if (!context) {
    throw new Error(
        'useScrollSpyContext must be used within <ScrollSpyProvider>.',
    );
  }

  return context as UseScrollSpyReturn<T>;
}

//------------------------------------------------------
// Exports
//------------------------------------------------------

export {ScrollSpyProvider, useScrollSpyContext};

export type {ScrollSpyProviderProps};
