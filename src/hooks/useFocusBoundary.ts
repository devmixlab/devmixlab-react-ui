import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

type UseFocusBoundaryOptions = {
    active: boolean;

    containerRef: RefObject<HTMLElement | null>;

    onForwardBoundary?: () => void;

    onBackwardBoundary?: () => void;
};

const isVisible = (element: HTMLElement): boolean =>
    !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);

export const useFocusBoundary = ({
    active,
    containerRef,
    onForwardBoundary,
    onBackwardBoundary,
}: UseFocusBoundaryOptions) => {
    useEffect(() => {
        if (!active) {
            return;
        }

        const container = containerRef.current;

        if (!container) {
            return;
        }

        const getFocusableElements = (): HTMLElement[] =>
            Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                (element) =>
                    !element.hasAttribute('disabled') &&
                    element.tabIndex !== -1 &&
                    isVisible(element),
            );

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = getFocusableElements();

            if (!focusableElements.length) {
                return;
            }

            const first = focusableElements[0];

            const last = focusableElements[focusableElements.length - 1];

            const activeElement = document.activeElement;

            if (event.shiftKey && activeElement === first) {
                event.preventDefault();

                onBackwardBoundary?.();

                return;
            }

            if (!event.shiftKey && activeElement === last) {
                event.preventDefault();

                onForwardBoundary?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [active, containerRef, onForwardBoundary, onBackwardBoundary]);
};
