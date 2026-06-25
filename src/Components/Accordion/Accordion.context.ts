import { createContext, useContext } from 'react';
import { FocusableListResult, FocusableItem } from '../../hooks/useFocusableList';
import { AccordionDensity } from './Accordion';

type AccordionContextValue = {
    value: string[];
    toggle: (value: string) => void;
    multiple: boolean;
    collapsible?: boolean;
    id: string;

    focusable: FocusableListResult;
    registerFocusable: (item: FocusableItem) => void;
    unregisterFocusable: (id: string) => void;

    variant?: string;
    density: AccordionDensity;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordionContext = () => {
    const context = useContext(AccordionContext);

    if (!context) {
        throw new Error('Accordion components must be used inside <Accordion>.');
    }

    return context;
};

//----------------------------------------------------------------
// Exports
//----------------------------------------------------------------

export type { AccordionContextValue };

export { AccordionContext, useAccordionContext };
