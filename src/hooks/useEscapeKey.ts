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
            if (e.defaultPrevented) {
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                onEscape();
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [active, containerRef, onEscape]);
};
