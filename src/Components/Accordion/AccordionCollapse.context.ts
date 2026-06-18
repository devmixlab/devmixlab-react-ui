import { createContext, useContext } from 'react';

type AccordionCollapseContextValue = {
    enterDuration: number;
    exitDuration: number;
    enterEasing: string;
    exitEasing: string;
    keepMounted: boolean;
    reduceMotion: boolean;
    triggerDuration: number;
    triggerEasing: string;
};

const AccordionCollapseContext = createContext<AccordionCollapseContextValue | null>(null);

const useAccordionCollapseContext = () => {
    const context = useContext(AccordionCollapseContext);

    if (!context) {
        throw new Error('Collapse components must be used inside <Collapse>.');
    }

    return context;
};

export type { AccordionCollapseContextValue };

export { AccordionCollapseContext, useAccordionCollapseContext };
