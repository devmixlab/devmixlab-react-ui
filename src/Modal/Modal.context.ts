import React, { createContext, useContext } from 'react';

export type ModalContextValue = {
    onClose?: () => void;

    headerId?: string;
    bodyId?: string;

    hasHeader: boolean;
    hasBody: boolean;

    setHasHeader: React.Dispatch<React.SetStateAction<boolean>>;
    setHasBody: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export const useModalContext = () => {
    return useContext(ModalContext);
};
