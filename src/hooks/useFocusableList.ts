import React, { useRef, useState, useCallback, useMemo } from 'react';

type FocusableItem = {
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

    focusNext: (direction?: 1 | -1) => void;

    setRef: (id: string) => (node: HTMLElement | null) => void;

    firstFocusableId: string | null;
    lastFocusableId: string | null;

    itemRefs: React.MutableRefObject<Map<string, HTMLElement | null>>;
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
        focusNext,

        setRef,

        firstFocusableId,
        lastFocusableId,

        itemRefs,
    };
}

// import { useRef, useState, useCallback } from 'react';
//
// type FocusableItem = {
//     disabled?: boolean;
// };
//
// export type FocusableListResult = {
//     focused: number | null;
//     focusedVisible: number | null;
//
//     setFocused: React.Dispatch<React.SetStateAction<number | null>>;
//
//     setFocusedVisible: React.Dispatch<React.SetStateAction<number | null>>;
//
//     setFocuses: (index: number | null, indexVisible?: number | null) => void;
//
//     focusFirst: () => void;
//     focusLast: () => void;
//
//     focusNext: (direction?: 1 | -1) => void;
//
//     setRef: (index: number) => (node: HTMLElement | null) => void;
//
//     firstFocusableIndex: number;
//     lastFocusableIndex: number;
//
//     itemRefs: React.MutableRefObject<Array<HTMLElement | null>>;
// };
//
// export function useFocusableList<T extends FocusableItem>(items: T[]): FocusableListResult {
//     const [focused, setFocused] = useState<number | null>(null);
//     const [focusedVisible, setFocusedVisible] = useState<number | null>(null);
//     const itemRefs = useRef<Array<HTMLElement | null>>([]);
//
//     const setFocuses = useCallback((index: number | null, indexVisible?: number | null) => {
//         setFocused(index);
//         setFocusedVisible(indexVisible ?? index);
//     }, []);
//
//     const findNext = useCallback(
//         (from: number, direction: 1 | -1 = 1): number | null => {
//             if (!items.length) return null;
//             let index = from;
//             for (let i = 0; i < items.length; i++) {
//                 index = (index + direction + items.length) % items.length;
//                 if (!items[index].disabled) return index;
//             }
//             return null;
//         },
//         [items],
//     );
//
//     const focusFirst = useCallback(() => {
//         const i = items.findIndex((o) => !o.disabled);
//         if (i !== -1) itemRefs.current[i]?.focus();
//     }, [items]);
//
//     const focusLast = useCallback(() => {
//         for (let i = items.length - 1; i >= 0; i--) {
//             if (!items[i].disabled) {
//                 itemRefs.current[i]?.focus();
//                 return;
//             }
//         }
//     }, [items]);
//
//     const focusNext = useCallback(
//         (direction: 1 | -1 = 1) => {
//             const start = focused == null ? (direction === 1 ? items.length - 1 : 0) : focused;
//             const next = findNext(start, direction);
//             if (next != null) itemRefs.current[next]?.focus();
//         },
//         [focused, items, findNext],
//     );
//
//     const setRef = useCallback(
//         (index: number) => (node: HTMLElement | null) => {
//             itemRefs.current[index] = node;
//         },
//         [],
//     );
//
//     const firstFocusableIndex = items.findIndex((o) => !o.disabled);
//     const lastFocusableIndex = (() => {
//         for (let i = items.length - 1; i >= 0; i--) {
//             if (!items[i].disabled) return i;
//         }
//         return -1;
//     })();
//
//     return {
//         focused,
//         focusedVisible,
//         setFocused,
//         setFocusedVisible,
//         setFocuses,
//         focusFirst,
//         focusLast,
//         focusNext,
//         setRef,
//         firstFocusableIndex,
//         lastFocusableIndex,
//         itemRefs,
//     };
// }

// import React, { useRef, useState, useCallback, useMemo } from 'react';
//
// type FocusableItem = {
//     id: string;
//     disabled?: boolean;
// };
//
// export type FocusableListResult = {
//     focusedId: string | null;
//     focusedVisibleId: string | null;
//
//     setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;
//
//     setFocusedVisibleId: React.Dispatch<React.SetStateAction<string | null>>;
//
//     setFocuses: (id: string | null, visibleId?: string | null) => void;
//
//     focusFirst: () => void;
//     focusLast: () => void;
//
//     focusNext: (direction?: 1 | -1) => void;
//
//     setRef: (id: string) => (node: HTMLElement | null) => void;
//
//     firstFocusableId: string | null;
//     lastFocusableId: string | null;
//
//     itemRefs: React.MutableRefObject<Map<string, HTMLElement | null>>;
// };
//
// export function useFocusableList<T extends FocusableItem>(items: T[]): FocusableListResult {
//     const [focusedId, setFocusedId] = useState<string | null>(null);
//
//     const [focusedVisibleId, setFocusedVisibleId] = useState<string | null>(null);
//
//     const itemRefs = useRef<Map<string, HTMLElement | null>>(new Map());
//
//     const enabledItems = useMemo(() => items.filter((item) => !item.disabled), [items]);
//
//     const setFocuses = useCallback((id: string | null, visibleId?: string | null) => {
//         setFocusedId(id);
//         setFocusedVisibleId(visibleId ?? id);
//     }, []);
//
//     const focusItem = useCallback((id: string | null) => {
//         if (!id) return;
//
//         itemRefs.current.get(id)?.focus();
//     }, []);
//
//     const focusFirst = useCallback(() => {
//         focusItem(enabledItems[0]?.id ?? null);
//     }, [enabledItems, focusItem]);
//
//     const focusLast = useCallback(() => {
//         focusItem(enabledItems[enabledItems.length - 1]?.id ?? null);
//     }, [enabledItems, focusItem]);
//
//     const focusNext = useCallback(
//         (direction: 1 | -1 = 1) => {
//             if (!enabledItems.length) return;
//
//             const currentIndex = enabledItems.findIndex((item) => item.id === focusedId);
//
//             const startIndex = currentIndex === -1 ? (direction === 1 ? -1 : 0) : currentIndex;
//
//             const nextIndex = (startIndex + direction + enabledItems.length) % enabledItems.length;
//
//             focusItem(enabledItems[nextIndex]?.id ?? null);
//         },
//         [enabledItems, focusedId, focusItem],
//     );
//
//     const setRef = useCallback(
//         (id: string) => (node: HTMLElement | null) => {
//             itemRefs.current.set(id, node);
//         },
//         [],
//     );
//
//     const firstFocusableId = enabledItems[0]?.id ?? null;
//
//     const lastFocusableId = enabledItems[enabledItems.length - 1]?.id ?? null;
//
//     return {
//         focusedId,
//         focusedVisibleId,
//
//         setFocusedId,
//         setFocusedVisibleId,
//
//         setFocuses,
//
//         focusFirst,
//         focusLast,
//         focusNext,
//
//         setRef,
//
//         firstFocusableId,
//         lastFocusableId,
//
//         itemRefs,
//     };
// }
