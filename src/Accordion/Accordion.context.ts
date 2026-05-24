import { createContext, useContext } from 'react';

type AccordionContextValue = {
    value: string[];
    toggle: (value: string) => void;
    multiple: boolean;
    collapsible?: boolean;
    id: string;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordionContext = () => {
    const context = useContext(AccordionContext);

    if (!context) {
        throw new Error('Accordion components must be used inside <Accordion>.');
    }

    return context;
};

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
        throw new Error('Accordion components must be used inside <Accordion.Item>.');
    }

    return context;
};

export {
    AccordionContextValue,
    AccordionContext,
    useAccordionContext,
    AccordionItemContextValue,
    AccordionItemContext,
    useAccordionItemContext,
};
