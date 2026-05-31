import { createContext, useContext } from 'react';

import { NestedLayersHook } from '../hooks/useNestedLayers';

// -----------------------------------------------------------------------------
// OffcanvasContext
// -----------------------------------------------------------------------------

type OffcanvasContextValue = {
    nestedLayers: NestedLayersHook;
    onClose?: () => void;
};

const OffcanvasContext = createContext<OffcanvasContextValue | undefined>(undefined);

const OffcanvasProvider = OffcanvasContext.Provider;

const useOffcanvasContext = () => {
    const context = useContext(OffcanvasContext);

    if (!context) {
        throw new Error('useOffcanvasContext must be used within OffcanvasProvider');
    }

    return context;
};

export { OffcanvasContext, OffcanvasProvider, useOffcanvasContext };

export type { OffcanvasContextValue };
