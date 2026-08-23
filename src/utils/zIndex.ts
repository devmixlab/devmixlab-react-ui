export const zLayers = {
  dropdown: 5000,
  sticky: 2000,
  overlay: 3000,
  modal: 4000,
  popover: 5000,
  tooltip: 6000,
  toast: 7000,
} as const;

export type ZLayer = keyof typeof zLayers;

const zIndexOffsets = new Map<ZLayer, number>();

export const getNextZIndex = (layer: ZLayer): number => {
  const nextOffset = (zIndexOffsets.get(layer) ?? 0) + 1;

  zIndexOffsets.set(layer, nextOffset);

  return zLayers[layer] + nextOffset;
};

export const getBaseZIndex = (layer: ZLayer): number => {
  return zLayers[layer];
};

export const resetZIndex = (layer?: ZLayer): void => {
  if (layer) {
    zIndexOffsets.delete(layer);
    return;
  }

  zIndexOffsets.clear();
};
