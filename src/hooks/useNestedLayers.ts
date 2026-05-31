import React, { useRef, useCallback } from 'react';

export type NestedLayer = {
    node: HTMLElement;
    modal: boolean;
};

type CreateNestedLayerRefOptions = {
    modal?: boolean;
};

export type NestedLayersHook = {
    nestedLayersRef: React.MutableRefObject<Set<NestedLayer>>;

    registerNestedLayer: (node: HTMLElement, options?: CreateNestedLayerRefOptions) => void;

    unregisterNestedLayer: (node: HTMLElement) => void;

    isInsideNestedLayer: (target: Node | null) => boolean;

    hasActiveModalLayer: () => boolean;

    createNestedLayerRef: (
        options?: CreateNestedLayerRefOptions,
    ) => (node: HTMLElement | null) => void;
};

export function useNestedLayers(): NestedLayersHook {
    const nestedLayersRef = useRef(new Set<NestedLayer>());

    const registerNestedLayer = useCallback(
        (node: HTMLElement, { modal = false }: CreateNestedLayerRefOptions = {}) => {
            nestedLayersRef.current.add({
                node,
                modal,
            });
        },
        [],
    );

    const unregisterNestedLayer = useCallback((node: HTMLElement) => {
        nestedLayersRef.current.forEach((layer) => {
            if (layer.node === node) {
                nestedLayersRef.current.delete(layer);
            }
        });
    }, []);

    const isInsideNestedLayer = useCallback((target: Node | null) => {
        if (!target) {
            return false;
        }

        return [...nestedLayersRef.current].some((layer) => layer.node.contains(target));
    }, []);

    const hasActiveModalLayer = useCallback(() => {
        return [...nestedLayersRef.current].some((layer) => layer.modal);
    }, []);

    const createNestedLayerRef = useCallback(
        ({ modal = false }: CreateNestedLayerRefOptions = {}) => {
            let current: HTMLElement | null = null;

            return (node: HTMLElement | null) => {
                if (current && current !== node) {
                    unregisterNestedLayer(current);
                }

                if (node && current !== node) {
                    registerNestedLayer(node, {
                        modal,
                    });
                }

                current = node;
            };
        },
        [registerNestedLayer, unregisterNestedLayer],
    );

    return {
        nestedLayersRef,
        registerNestedLayer,
        unregisterNestedLayer,
        isInsideNestedLayer,
        hasActiveModalLayer,
        createNestedLayerRef,
    };
}
