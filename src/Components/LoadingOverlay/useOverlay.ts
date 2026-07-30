import { useContext } from 'react';

import { OverlayContext } from './OverlayContext';

const useOverlay = () => {
  const context = useContext(OverlayContext);

  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider.');
  }

  return context;
};

export { useOverlay };
