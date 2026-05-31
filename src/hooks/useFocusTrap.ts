import React, { useLayoutEffect, useRef, RefObject, MutableRefObject } from 'react';

import { NestedLayer } from '../hooks/useNestedLayers';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export type UseFocusTrapOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    nestedLayersRef?: MutableRefObject<Set<NestedLayer>>;
    onEscape?: () => void;
    isActive?: () => boolean;
    closeOnEscape?: boolean;
    restoreFocus?: boolean;
    initialFocus?: RefObject<HTMLElement | null>;
};

const isVisible = (el: HTMLElement): boolean =>
    !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

export function useFocusTrap({
    active,
    containerRef,
    nestedLayersRef,
    onEscape,
    isActive = () => true,
    closeOnEscape = true,
    restoreFocus = true,
    initialFocus,
}: UseFocusTrapOptions): void {
    const onEscapeRef = useRef(onEscape);
    const isActiveRef = useRef(isActive);
    const previousFocusedRef = useRef<HTMLElement | null>(null);

    useLayoutEffect(() => {
        onEscapeRef.current = onEscape;
    });

    useLayoutEffect(() => {
        isActiveRef.current = isActive;
    });

    useLayoutEffect(() => {
        if (!active) {
            return;
        }

        const container = containerRef.current;

        if (!container) {
            return;
        }

        previousFocusedRef.current = document.activeElement as HTMLElement | null;

        if (!container.hasAttribute('tabindex')) {
            container.tabIndex = -1;
        }

        const getContainers = (): HTMLElement[] => [
            container,
            ...(nestedLayersRef
                ? [...nestedLayersRef.current]
                      .filter((layer) => !layer.modal)
                      .map((layer) => layer.node)
                : []),
        ];

        const isInScope = (target: Node | null): boolean => {
            if (!target) return false;
            return getContainers().some((c) => c.contains(target));
        };

        const isInModalNestedLayer = (target: Node | null): boolean => {
            if (!target || !nestedLayersRef) return false;
            return [...nestedLayersRef.current]
                .filter((layer) => layer.modal)
                .some((layer) => layer.node.contains(target));
        };

        const getFocusable = (): HTMLElement[] =>
            getContainers().flatMap((c) =>
                Array.from(c.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1 && isVisible(el),
                ),
            );

        const focusable = getFocusable();

        const initial =
            initialFocus?.current &&
            isInScope(initialFocus.current) &&
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

            // If focus is inside a modal nested layer, let that layer
            // handle all its own keyboard events — don't interfere
            if (isInModalNestedLayer(document.activeElement)) return;

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

            if (!activeElement || !isInScope(activeElement)) {
                e.preventDefault();
                first.focus();
                return;
            }

            if (e.shiftKey) {
                if (activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
                return;
            }

            if (activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        const onFocusIn = (e: FocusEvent): void => {
            if (!isActiveRef.current()) return;

            requestAnimationFrame(() => {
                const target = (document.activeElement as Node | null) ?? (e.target as Node | null);

                // Don't reclaim focus from a modal nested layer —
                // it owns its own focus scope
                if (isInModalNestedLayer(target)) return;

                if (isInScope(target)) return;

                const elements = getFocusable();

                if (elements.length) {
                    elements[0].focus();
                } else {
                    container.focus();
                }
            });
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
    }, [active, containerRef, nestedLayersRef, closeOnEscape, restoreFocus, initialFocus]);
}
