export const zLayers = {
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    toast: 1600,
} as const;

type ZLayer = keyof typeof zLayers;

const zIndexCounters = new Map<ZLayer, number>();

export const getNextZIndex = (layer: ZLayer) => {
    const current = zIndexCounters.get(layer) ?? zLayers[layer];

    const next = current + 1;

    zIndexCounters.set(layer, next);

    return next;
};

export const resetZIndex = (layer?: ZLayer) => {
    if (layer) {
        zIndexCounters.delete(layer);

        return;
    }

    zIndexCounters.clear();
};
