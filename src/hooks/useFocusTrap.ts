import { useLayoutEffect, useRef, RefObject } from 'react';

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
     * Whether the trap is active. When false the hook is entirely inert —
     * no listeners are attached and focus is not moved.
     */
    active: boolean;

    /**
     * Ref to the container element that defines the trap boundary.
     */
    containerRef: RefObject<HTMLElement | null>;

    /**
     * Called when the user presses Escape while this trap is active.
     */
    onEscape?: () => void;

    /**
     * Guard called before acting on Escape. Return false to let the event
     * pass through (e.g. when a nested modal sits on top of this one).
     * @default () => true
     */
    isActive?: () => boolean;
};

/**
 * Traps keyboard focus inside `containerRef` while `active` is true.
 *
 * On activation:
 *   Moves focus to the first focusable descendant, or the container itself.
 *
 * While active:
 *   - Tab / Shift+Tab cycle within focusable descendants.
 *   - Escape calls `onEscape` when `isActive()` returns true.
 *
 * Focus restoration is intentionally excluded — callers should handle it
 * separately (e.g. via ModalManager.captureFocus / restoreFocus) so that
 * nested traps each restore to the element active when *they* opened.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useFocusTrap({
 *   active: isMounted,
 *   containerRef: ref,
 *   onEscape: onClose,
 *   isActive: () => modalManager.isTop(id),
 * });
 */
export function useFocusTrap({
    active,
    containerRef,
    onEscape,
    isActive = () => true,
}: UseFocusTrapOptions): void {
    // Keep latest callbacks in refs so the keydown handler never goes stale
    // without needing to be re-registered when props change.
    const onEscapeRef = useRef(onEscape);
    const isActiveRef = useRef(isActive);

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

        const getFocusable = (): HTMLElement[] =>
            Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
            );

        // Move focus in.
        const focusable = getFocusable();
        if (focusable.length > 0) {
            focusable[0].focus();
        } else {
            container.focus();
        }

        const onKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                if (isActiveRef.current()) onEscapeRef.current?.();
                return;
            }

            if (e.key !== 'Tab') return;

            const elements = getFocusable();
            if (!elements.length) {
                e.preventDefault();
                return;
            }

            const first = elements[0];
            const last = elements[elements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
        // containerRef is a stable object; only `active` re-runs this effect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);
}
