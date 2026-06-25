import { createContext, useContext } from 'react';

type AccordionItemContextValue = {
    value: string;
    open: boolean;
    disabled: boolean;
    triggerId: string;
    contentId: string;
};

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionItemContext = () => {
    const context = useContext(AccordionItemContext);

    if (!context) {
        throw new Error('`useAccordionItemContext` must be used inside <Accordion.Item>.');
    }

    return context;
};

//----------------------------------------------------------------
// Exports
//----------------------------------------------------------------

export type { AccordionItemContextValue };

export { AccordionItemContext, useAccordionItemContext };
