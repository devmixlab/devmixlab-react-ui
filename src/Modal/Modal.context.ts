// Modal.context.ts

import { createContext, useContext } from 'react';

export type ModalContextValue = {
    onClose?: () => void;

    headerId?: string;
    bodyId?: string;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModalContext = () => {
    return useContext(ModalContext);
};
