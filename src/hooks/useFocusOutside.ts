import { RefObject, useEffect } from 'react';

type UseFocusOutsideOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onOutsideFocus: () => void;
};

export const useFocusOutside = ({
    active,
    containerRef,
    onOutsideFocus,
}: UseFocusOutsideOptions) => {
    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;

        if (!container) return;

        const handleFocusIn = () => {
            const activeElement = document.activeElement;

            if (activeElement instanceof HTMLElement && !container.contains(activeElement)) {
                onOutsideFocus();
            }
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [active, containerRef, onOutsideFocus]);
};
