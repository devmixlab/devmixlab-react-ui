import React, { useRef, useCallback } from 'react';

export type NestedLayersHook = {
    nestedLayersRef: React.MutableRefObject<Set<HTMLElement>>;

    registerNestedLayer: (node: HTMLElement) => void;

    unregisterNestedLayer: (node: HTMLElement) => void;

    isInsideNestedLayer: (target: Node | null) => boolean;

    createNestedLayerRef: () => (node: HTMLElement | null) => void;
};

export function useNestedLayers(): NestedLayersHook {
    const nestedLayersRef = useRef(new Set<HTMLElement>());

    const registerNestedLayer = useCallback((node: HTMLElement) => {
        nestedLayersRef.current.add(node);
    }, []);

    const unregisterNestedLayer = useCallback((node: HTMLElement) => {
        nestedLayersRef.current.delete(node);
    }, []);

    const isInsideNestedLayer = useCallback((target: Node | null) => {
        if (!target) {
            return false;
        }

        return [...nestedLayersRef.current].some((node) => node.contains(target));
    }, []);

    const createNestedLayerRef = useCallback(() => {
        let current: HTMLElement | null = null;

        return (node: HTMLElement | null) => {
            if (current && current !== node) {
                unregisterNestedLayer(current);
            }

            if (node && current !== node) {
                registerNestedLayer(node);
            }

            current = node;
        };
    }, [registerNestedLayer, unregisterNestedLayer]);

    return {
        nestedLayersRef,
        registerNestedLayer,
        unregisterNestedLayer,
        isInsideNestedLayer,
        createNestedLayerRef,
    };
}
