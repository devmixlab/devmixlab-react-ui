import { RefObject, useEffect } from 'react';

type UseFocusOutsideOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onOutsideFocus: (event: FocusEvent) => void;
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

        const handleFocusIn = (event: FocusEvent) => {
            const target = event.target;

            if (target instanceof HTMLElement && !container.contains(target)) {
                onOutsideFocus(event);
            }
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => {
            document.removeEventListener('focusin', handleFocusIn);
        };
    }, [active, containerRef, onOutsideFocus]);
};
