import { RefObject, useEffect } from 'react';

type UseAutoFocusOptions = {
    active: boolean;

    containerRef: RefObject<HTMLElement | null>;

    initialFocusRef?: RefObject<HTMLElement | null>;

    fallbackToContainer?: boolean;
};

const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useAutoFocus({
    active,
    containerRef,
    initialFocusRef,
    fallbackToContainer = true,
}: UseAutoFocusOptions) {
    useEffect(() => {
        if (!active) {
            return;
        }

        requestAnimationFrame(() => {
            const initialFocusElement = initialFocusRef?.current;

            if (initialFocusElement) {
                initialFocusElement.focus();
                return;
            }

            const firstFocusable =
                containerRef.current?.querySelector<HTMLElement>(focusableSelector);

            if (firstFocusable) {
                firstFocusable.focus();
                return;
            }

            if (fallbackToContainer) {
                containerRef.current?.focus();
            }
        });
    }, [active, containerRef, initialFocusRef, fallbackToContainer]);
}
