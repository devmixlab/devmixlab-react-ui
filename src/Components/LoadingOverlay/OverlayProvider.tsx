import { ReactNode, useCallback, useMemo, useState } from 'react';

import { Overlay } from './Overlay';
import { OverlayContext, OverlayOptions } from './OverlayContext';

type OverlayProviderProps = {
  children: ReactNode;
};

const OverlayProvider = ({ children }: OverlayProviderProps) => {
  const [options, setOptions] = useState<OverlayOptions | null>(null);

  const show = useCallback((options: OverlayOptions = {}) => {
    setOptions(options);
  }, []);

  const hide = useCallback(() => {
    setOptions(null);
  }, []);

  const value = useMemo(
    () => ({
      show,
      hide,
    }),
    [show, hide],
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}

      <Overlay visible={options !== null} spinner={options?.spinner}>
        {options?.children}
      </Overlay>
    </OverlayContext.Provider>
  );
};

export { OverlayProvider };
