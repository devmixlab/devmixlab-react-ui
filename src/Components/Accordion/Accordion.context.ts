import { createContext, useContext } from 'react';
import { FocusableListResult, FocusableItem } from '../../hooks/useFocusableList';
import { OwnCollapseProps } from '../Collapse';

type AccordionContextValue = {
    value: string[];
    toggle: (value: string) => void;
    multiple: boolean;
    collapsible?: boolean;
    id: string;

    focusable: FocusableListResult;
    registerFocusable: (item: FocusableItem) => void;
    unregisterFocusable: (id: string) => void;
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
