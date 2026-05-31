import React, { useLayoutEffect, useRef, RefObject } from 'react';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export type UseFocusTrapOptions = {
    /**
     * Whether the trap is active.
     */
    active: boolean;

    /**
     * Trap boundary element.
     */
    containerRef: RefObject<HTMLElement | null>;

    /**
     * Called when Escape is pressed.
     */
    onEscape?: () => void;

    /**
     * Whether this trap is currently the active/top-most one.
     * Useful for nested dialogs/modals.
     *
     * @default () => true
     */
    isActive?: () => boolean;

    /**
     * Enables Escape close handling.
     *
     * @default true
     */
    closeOnEscape?: boolean;

    /**
     * Restores focus to the previously focused element
     * when the trap deactivates.
     *
     * @default true
     */
    restoreFocus?: boolean;

    /**
     * Element to focus on activation.
     */
    initialFocus?: RefObject<HTMLElement | null>;
};

const isVisible = (el: HTMLElement): boolean =>
    !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

export function useFocusTrap({
    active,
    containerRef,
    onEscape,
    isActive = () => true,
    closeOnEscape = true,
    restoreFocus = true,
    initialFocus,
}: UseFocusTrapOptions): void {
    // Stable refs for latest callbacks.
    const onEscapeRef = useRef(onEscape);
    const isActiveRef = useRef(isActive);

    // Element focused before trap activation.
    const previousFocusedRef = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        onEscapeRef.current = onEscape;
    });

    useLayoutEffect(() => {
        isActiveRef.current = isActive;
    });

    useLayoutEffect(() => {
        if (!active) return;

        const container = containerRef.current;
        if (!container) return;

        previousFocusedRef.current = document.activeElement as HTMLElement | null;

        // Ensure container can receive fallback focus.
        if (!container.hasAttribute('tabindex')) {
            container.tabIndex = -1;
        }

        const getFocusable = (): HTMLElement[] =>
            Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && isVisible(el),
            );

        // Initial focus.
        const focusable = getFocusable();

        const initial =
            initialFocus?.current &&
            container.contains(initialFocus.current) &&
            !initialFocus.current.hasAttribute('disabled') &&
            isVisible(initialFocus.current)
                ? initialFocus.current
                : focusable[0];

        if (initial) {
            initial.focus();
        } else {
            container.focus();
        }

        const onKeyDown = (e: KeyboardEvent): void => {
            if (!isActiveRef.current()) return;

            // Escape handling.
            if (e.key === 'Escape' && closeOnEscape) {
                e.stopPropagation();
                onEscapeRef.current?.();
                return;
            }

            if (e.key !== 'Tab') return;

            const elements = getFocusable();

            if (!elements.length) {
                e.preventDefault();
                container.focus();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];
            const activeElement = document.activeElement as HTMLElement | null;

            // Focus escaped trap.
            if (!activeElement || !container.contains(activeElement)) {
                e.preventDefault();
                first.focus();
                return;
            }

            // Shift + Tab
            if (e.shiftKey) {
                if (activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }

                return;
            }

            // Tab
            if (activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        const onFocusIn = (e: FocusEvent): void => {
            if (!isActiveRef.current()) return;

            const target = e.target as Node | null;

            if (target && !container.contains(target)) {
                const elements = getFocusable();

                if (elements.length) {
                    elements[0].focus();
                } else {
                    container.focus();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('focusin', onFocusIn);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('focusin', onFocusIn);

            if (
                restoreFocus &&
                previousFocusedRef.current &&
                document.contains(previousFocusedRef.current)
            ) {
                previousFocusedRef.current.focus();
            }
        };

        // containerRef is stable.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);
}
