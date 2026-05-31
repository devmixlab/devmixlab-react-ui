import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

type UseLastFocusableItemTabOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onLastTab: () => void;
};

const isVisible = (el: HTMLElement): boolean =>
    !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

export const useLastFocusableItemTab = ({
    active,
    containerRef,
    onLastTab,
}: UseLastFocusableItemTabOptions) => {
    useEffect(() => {
        if (!active) {
            return;
        }

        const container = containerRef.current;

        if (!container) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab' || event.shiftKey) {
                return;
            }

            const focusable = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
            ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && isVisible(el));

            const last = focusable[focusable.length - 1];

            if (last && document.activeElement === last) {
                onLastTab();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [active, containerRef, onLastTab]);
};
