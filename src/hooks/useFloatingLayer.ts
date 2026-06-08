import {
    useFloating,
    useDismiss,
    useInteractions,
    useFloatingNodeId,
    useFloatingParentNodeId,
    offset,
    flip,
    shift,
    autoUpdate,
    type Placement,
} from '@floating-ui/react';
import { useCallback, useEffect } from 'react';

type FloatingLayerProps = {
    opened: boolean;
    onOpenChange: (open: boolean) => void;
    placement?: Placement;
    offsetValue?: number;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
};

export function useFloatingLayer({
    opened,
    onOpenChange,
    placement = 'bottom-end',
    offsetValue = 4,
    closeOnOutsideClick = true,
    closeOnEscape = true,
}: FloatingLayerProps) {
    const nodeId = useFloatingNodeId();
    const parentId = useFloatingParentNodeId();

    const {
        refs,
        floatingStyles,
        context,
        placement: resolvedPlacement,
    } = useFloating<HTMLDivElement>({
        nodeId,
        open: opened,
        onOpenChange,
        placement,
        strategy: 'fixed',
        transform: false,
        whileElementsMounted: autoUpdate,
        middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
    });

    const restoreFocus = useCallback(() => {
        requestAnimationFrame(() => {
            const trigger = refs.reference.current as HTMLElement | null;
            const floating = refs.floating.current;
            const activeElement = document.activeElement as HTMLElement | null;

            // focus already somewhere meaningful
            if (
                activeElement &&
                activeElement !== document.body &&
                activeElement !== trigger &&
                !floating?.contains(activeElement)
            ) {
                return;
            }

            trigger?.focus();
        });
    }, [refs.reference, refs.floating]);

    // useEffect(() => {
    //     if (!opened) {
    //         restoreFocus();
    //     }
    // }, [opened, restoreFocus]);

    // useEffect(() => {
    //     if (!opened) return;
    //
    //     const handleKeyDown = (e: KeyboardEvent) => {
    //         if (e.key === 'Escape') {
    //             // e.stopPropagation();
    //             onOpenChange(false);
    //         }
    //     };
    //
    //     document.addEventListener('keydown', handleKeyDown);
    //     return () => document.removeEventListener('keydown', handleKeyDown);
    // }, [opened, onOpenChange]);

    const dismiss = useDismiss(context, {
        outsidePress: closeOnOutsideClick,
        escapeKey: closeOnEscape, // always handled by handleKeyDown
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    return {
        nodeId,
        refs,
        floatingStyles,
        context,
        getReferenceProps,
        getFloatingProps,
        restoreFocus,
        placement: resolvedPlacement,
    };
}
