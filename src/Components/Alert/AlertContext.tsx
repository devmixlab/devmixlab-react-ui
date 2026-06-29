import { createContext } from 'react';
import type { AlertContextValue } from './Alert.types';

const AlertContext = createContext<AlertContextValue | null>(null);

AlertContext.displayName = 'AlertContext';

export { AlertContext };
