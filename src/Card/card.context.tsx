import { createContext, useContext } from 'react';
import { type Density } from './card.tokens';

// -----------------------------------------------------------------------------
// Context type
// -----------------------------------------------------------------------------
export type CardContextProps = {
    density: Density;
    interactive: boolean;
    disabled: boolean;
};

// -----------------------------------------------------------------------------
// Context
// Create the context with undefined as default
// This forces consumers to check/use the Provider
// -----------------------------------------------------------------------------
const CardContext = createContext<CardContextProps | undefined>(undefined);

// -----------------------------------------------------------------------------
// Helper hook to use the context safely
// -----------------------------------------------------------------------------
export const useCardContext = (): CardContextProps => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('CardContext must be used within a <__Card.Provider>');
    }
    return context;
};

// -----------------------------------------------------------------------------
// Context Card Provider
// -----------------------------------------------------------------------------
export const CardProvider = CardContext.Provider;
