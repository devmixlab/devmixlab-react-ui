import { RefObject, useEffect, useRef } from 'react';

type UseRestoreFocusOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
};

export const useRestoreFocus = ({ active, containerRef }: UseRestoreFocusOptions) => {
    const restoreRef = useRef<HTMLElement | null>(null);
    const previousActiveRef = useRef(active);

    useEffect(() => {
        const previousActive = previousActiveRef.current;

        previousActiveRef.current = active;

        if (active && !previousActive) {
            const activeElement = document.activeElement;

            if (
                activeElement instanceof HTMLElement &&
                !containerRef.current?.contains(activeElement)
            ) {
                restoreRef.current = activeElement;
            }
        }

        if (!active && previousActive) {
            requestAnimationFrame(() => {
                const activeElement = document.activeElement;
                const container = containerRef.current;

                const shouldRestore =
                    !activeElement ||
                    activeElement === document.body ||
                    (container != null && container.contains(activeElement));

                if (shouldRestore) {
                    restoreRef.current?.focus();
                }
            });
        }
    }, [active, containerRef]);
};
