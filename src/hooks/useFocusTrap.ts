import React, { useLayoutEffect, useRef, RefObject, MutableRefObject } from 'react';

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

    nestedLayersRef?: MutableRefObject<Set<HTMLElement>>;

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
    const lastFocusedInScopeRef = useRef<HTMLElement | null>(null);

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
            ...(nestedLayersRef ? [...nestedLayersRef.current] : []),
        ];

        const isInScope = (target: Node | null): boolean => {
            if (!target) {
                return false;
            }

            return getContainers().some((container) => container.contains(target));
        };

        const isInRootScope = (target: Node | null): boolean => {
            if (!target) {
                return false;
            }

            return container.contains(target);
        };

        const updateLastFocused = (target: Node | null) => {
            if (target instanceof HTMLElement && isInScope(target)) {
                lastFocusedInScopeRef.current = target;
            }
        };

        const getFocusable = (): HTMLElement[] =>
            getContainers().flatMap((container) =>
                Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
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
            lastFocusedInScopeRef.current = initial;
        } else {
            container.focus();
            lastFocusedInScopeRef.current = container;
        }

        const onKeyDown = (e: KeyboardEvent): void => {
            if (!isActiveRef.current()) {
                return;
            }

            if (e.key === 'Escape' && closeOnEscape) {
                e.stopPropagation();
                onEscapeRef.current?.();
                return;
            }

            if (e.key !== 'Tab') {
                return;
            }

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
                return;
            }

            if (e.shiftKey) {
                if (activeElement === first && isInRootScope(activeElement)) {
                    e.preventDefault();
                    last.focus();
                }

                return;
            }

            if (activeElement === last && isInRootScope(activeElement)) {
                e.preventDefault();
                first.focus();
            }
        };

        const onFocusIn = (e: FocusEvent): void => {
            if (!isActiveRef.current()) {
                return;
            }

            const target = e.target as Node | null;

            if (isInScope(target)) {
                updateLastFocused(target);
                return;
            }

            requestAnimationFrame(() => {
                const activeElement = document.activeElement;

                if (isInScope(activeElement)) {
                    updateLastFocused(activeElement);
                    return;
                }

                const bodyFocused =
                    activeElement === document.body || activeElement === document.documentElement;

                if (!bodyFocused) {
                    return;
                }

                lastFocusedInScopeRef.current?.focus();
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
