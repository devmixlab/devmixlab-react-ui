import { useContext } from 'react';

import { WindowSizeContext } from './ResponsiveContext';

export const useWindowSize = () => {
    const context = useContext(WindowSizeContext);

    if (!context) {
        throw new Error('useWindowSize must be used within WindowSizeProvider');
    }

    return context;
};
