import {
    useFloating,
    useDismiss,
    useInteractions,
    offset,
    flip,
    shift,
    autoUpdate,
    type Placement,
} from '@floating-ui/react';

// export function useFloatingLayer(
//     opened: boolean,
//     onOpenChange: (open: boolean) => void,
//     placement: Placement = 'bottom-end',
// ) {
//     const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
//         open: opened,
//         onOpenChange,
//         placement,
//         transform: false,
//         whileElementsMounted: autoUpdate,
//         middleware: [offset(4), flip(), shift({ padding: 8 })],
//     });
//
//     const dismiss = useDismiss(context);
//     const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);
//
//     return {
//         refs,
//         floatingStyles,
//         context,
//         getReferenceProps,
//         getFloatingProps,
//     };
// }

export function useFloatingLayer(
    opened: boolean,
    onOpenChange: (open: boolean) => void,
    placement: Placement = 'bottom-end',

    offsetValue: number = 4,

    closeOnOutsideClick: boolean = true,
) {
    const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
        open: opened,
        onOpenChange,
        placement,
        transform: false,
        whileElementsMounted: autoUpdate,

        middleware: [offset(offsetValue), flip(), shift({ padding: 8 })],
    });

    const dismiss = useDismiss(context, {
        outsidePress: closeOnOutsideClick,
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

    return {
        refs,
        floatingStyles,
        context,
        getReferenceProps,
        getFloatingProps,
    };
}
