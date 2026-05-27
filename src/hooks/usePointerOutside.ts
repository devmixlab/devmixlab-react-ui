import { RefObject, useEffect } from 'react';

type UsePointerOutsideOptions = {
    active: boolean;
    containerRef: RefObject<HTMLElement | null>;
    onPointerOutside: () => void;
};

export const usePointerOutside = ({
    active,
    containerRef,
    onPointerOutside,
}: UsePointerOutsideOptions) => {
    useEffect(() => {
        if (!active) return;

        const container = containerRef.current;

        if (!container) return;

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target;

            if (target instanceof HTMLElement && !container.contains(target)) {
                onPointerOutside();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
        };
    }, [active, containerRef, onPointerOutside]);
};
