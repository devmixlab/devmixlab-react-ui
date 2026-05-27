import { RefObject, useEffect } from 'react';

type UseEscapeKeyOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onEscape: () => void;
};

export const useEscapeKey = ({ active, containerRef, onEscape }: UseEscapeKeyOptions) => {
    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;

        if (!container) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onEscape();
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [active, containerRef, onEscape]);
};
