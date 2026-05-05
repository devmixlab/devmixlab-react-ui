import { useId } from 'react';

export const useStableId = (prefix?: string, providedId?: string) => {
    const reactId = useId();

    if (providedId) return providedId;

    const cleanId = reactId.replace(/:/g, '');

    return prefix ? `${prefix}-${cleanId}` : cleanId;
};
