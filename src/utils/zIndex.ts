const BASE_Z_INDEX = 1000;

let currentZIndex = BASE_Z_INDEX;

export const getNextZIndex = () => {
    currentZIndex += 1;

    return currentZIndex;
};

export const resetZIndex = () => {
    currentZIndex = BASE_Z_INDEX;
};
