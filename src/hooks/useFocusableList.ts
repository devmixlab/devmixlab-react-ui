import React, { useRef, useState, useCallback, useMemo } from 'react';

export type FocusableItem = {
    id: string;
    disabled?: boolean;
};

type PendingFocus = { type: 'first' } | { type: 'last' } | { type: 'id'; id: string } | null;

export type FocusableListResult = {
    focusedId: string | null;
    focusedVisibleId: string | null;

    setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;

    setFocusedVisibleId: React.Dispatch<React.SetStateAction<string | null>>;

    setFocuses: (id: string | null, visibleId?: string | null) => void;

    focusFirst: (pending?: boolean) => void;
    focusLast: (pending?: boolean) => void;

    focusById: (id: string, pending?: boolean) => void;

    focusNext: (direction?: 1 | -1) => void;

    setRef: (id: string) => (node: HTMLElement | null) => void;

    firstFocusableId: string | null;
    lastFocusableId: string | null;

    itemRefs: React.MutableRefObject<Map<string, HTMLElement | null>>;
    isFocusableElement: (node: Node | null) => boolean;
};

export function useFocusableList<T extends FocusableItem>(items: T[]): FocusableListResult {
    const [focusedId, setFocusedId] = useState<string | null>(null);

    const [focusedVisibleId, setFocusedVisibleId] = useState<string | null>(null);

    const itemRefs = useRef<Map<string, HTMLElement | null>>(new Map());

    const pendingFocusRef = useRef<PendingFocus>(null);

    const enabledItems = useMemo(() => items.filter((item) => !item.disabled), [items]);

    const setFocuses = useCallback((id: string | null, visibleId?: string | null) => {
        setFocusedId(id);
        setFocusedVisibleId(visibleId ?? id);
    }, []);

    const isFocusableElement = useCallback((node: Node | null) => {
        if (!(node instanceof HTMLElement)) {
            return false;
        }

        for (const ref of itemRefs.current.values()) {
            if (ref === node) {
                return true;
            }
        }

        return false;
    }, []);

    const focusItem = useCallback((id: string | null) => {
        if (!id) return false;

        const node = itemRefs.current.get(id);

        if (!node) return false;

        node.focus();

        return true;
    }, []);

    const flushPendingFocus = useCallback(() => {
        const pending = pendingFocusRef.current;

        if (!pending) return;

        if (pending.type === 'first') {
            const success = focusItem(enabledItems[0]?.id ?? null);

            if (success) {
                pendingFocusRef.current = null;
            }
        }

        if (pending.type === 'last') {
            const success = focusItem(enabledItems[enabledItems.length - 1]?.id ?? null);

            if (success) {
                pendingFocusRef.current = null;
            }
        }

        if (pending.type === 'id') {
            const success = focusItem(pending.id);

            if (success) {
                pendingFocusRef.current = null;
            }
        }
    }, [enabledItems, focusItem]);

    const focusFirst = useCallback(
        (pending = false) => {
            const success = focusItem(enabledItems[0]?.id ?? null);

            if (!success && pending) {
                pendingFocusRef.current = { type: 'first' };
            }
        },
        [enabledItems, focusItem],
    );

    const focusLast = useCallback(
        (pending = false) => {
            const success = focusItem(enabledItems[enabledItems.length - 1]?.id ?? null);

            if (!success && pending) {
                pendingFocusRef.current = { type: 'last' };
            }
        },
        [enabledItems, focusItem],
    );

    const focusById = useCallback(
        (id: string, pending = false) => {
            const success = focusItem(id);

            if (!success && pending) {
                pendingFocusRef.current = {
                    type: 'id',
                    id,
                };
            }
        },
        [focusItem],
    );

    const focusNext = useCallback(
        (direction: 1 | -1 = 1) => {
            if (!enabledItems.length) return;

            const currentIndex = enabledItems.findIndex((item) => item.id === focusedId);

            const startIndex = currentIndex === -1 ? (direction === 1 ? -1 : 0) : currentIndex;

            const nextIndex = (startIndex + direction + enabledItems.length) % enabledItems.length;

            focusItem(enabledItems[nextIndex]?.id ?? null);
        },
        [enabledItems, focusedId, focusItem],
    );

    const setRef = useCallback(
        (id: string) => (node: HTMLElement | null) => {
            itemRefs.current.set(id, node);

            if (node) {
                flushPendingFocus();
            }
        },
        [flushPendingFocus],
    );

    const firstFocusableId = enabledItems[0]?.id ?? null;

    const lastFocusableId = enabledItems[enabledItems.length - 1]?.id ?? null;

    return {
        focusedId,
        focusedVisibleId,

        setFocusedId,
        setFocusedVisibleId,

        setFocuses,

        focusFirst,
        focusLast,
        focusById,
        focusNext,

        setRef,

        firstFocusableId,
        lastFocusableId,

        itemRefs,
        isFocusableElement,
    };
}
