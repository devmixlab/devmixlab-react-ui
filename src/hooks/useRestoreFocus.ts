import { RefObject, useEffect, useRef } from 'react';

type RestoreMode = 'previous' | 'next';

type UseRestoreFocusOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    restoreMode?: RestoreMode;
};

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusableElements = (): HTMLElement[] =>
    Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
        (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
    );

const focusNextAfter = (element: HTMLElement | null) => {
    if (!element) {
        return;
    }

    const focusableElements = getFocusableElements();

    const index = focusableElements.indexOf(element);

    if (index === -1) {
        return;
    }

    focusableElements[index + 1]?.focus();
};

export const useRestoreFocus = ({
    active,
    containerRef,
    restoreMode = 'previous',
}: UseRestoreFocusOptions) => {
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

                if (!shouldRestore) {
                    return;
                }

                if (restoreMode === 'next') {
                    focusNextAfter(restoreRef.current);
                    return;
                }

                restoreRef.current?.focus();
            });
        }
    }, [active, containerRef, restoreMode]);
};
