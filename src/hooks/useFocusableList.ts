import { useRef, useState, useCallback } from 'react';

type FocusableItem = {
    disabled?: boolean;
};

export function useFocusableList<T extends FocusableItem>(items: T[]) {
    const [focused, setFocused] = useState<number | null>(null);
    const [focusedVisible, setFocusedVisible] = useState<number | null>(null);
    const itemRefs = useRef<Array<HTMLElement | null>>([]);

    const setFocuses = useCallback((index: number | null, indexVisible?: number | null) => {
        setFocused(index);
        setFocusedVisible(indexVisible ?? index);
    }, []);

    const findNext = useCallback(
        (from: number, direction: 1 | -1 = 1): number | null => {
            if (!items.length) return null;
            let index = from;
            for (let i = 0; i < items.length; i++) {
                index = (index + direction + items.length) % items.length;
                if (!items[index].disabled) return index;
            }
            return null;
        },
        [items],
    );

    const focusFirst = useCallback(() => {
        const i = items.findIndex((o) => !o.disabled);
        if (i !== -1) itemRefs.current[i]?.focus();
    }, [items]);

    const focusLast = useCallback(() => {
        for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].disabled) {
                itemRefs.current[i]?.focus();
                return;
            }
        }
    }, [items]);

    const focusNext = useCallback(
        (direction: 1 | -1 = 1) => {
            const start = focused == null ? (direction === 1 ? items.length - 1 : 0) : focused;
            const next = findNext(start, direction);
            if (next != null) itemRefs.current[next]?.focus();
        },
        [focused, items, findNext],
    );

    const setRef = useCallback(
        (index: number) => (node: HTMLElement | null) => {
            itemRefs.current[index] = node;
        },
        [],
    );

    const firstFocusableIndex = items.findIndex((o) => !o.disabled);
    const lastFocusableIndex = (() => {
        for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].disabled) return i;
        }
        return -1;
    })();

    return {
        focused,
        focusedVisible,
        setFocused,
        setFocusedVisible,
        setFocuses,
        focusFirst,
        focusLast,
        focusNext,
        setRef,
        firstFocusableIndex,
        lastFocusableIndex,
        itemRefs,
    };
}
