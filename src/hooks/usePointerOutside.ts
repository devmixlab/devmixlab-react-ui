import { RefObject, useEffect } from 'react';

type UsePointerOutsideOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    excludeRefs?: RefObject<HTMLElement | null>[];
    onPointerOutside: (e: PointerEvent) => void;
};

export const usePointerOutside = ({
    active,
    containerRef,
    excludeRefs = [],
    onPointerOutside,
}: UsePointerOutsideOptions) => {
    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;

        if (!container) return;

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target;

            if (!(target instanceof HTMLElement)) {
                return;
            }

            const isInsideContainer = container.contains(target);

            const isInsideExcluded = excludeRefs.some((ref) => ref.current?.contains(target));

            if (!isInsideContainer && !isInsideExcluded) {
                onPointerOutside(e);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [active, containerRef, excludeRefs, onPointerOutside]);
};
