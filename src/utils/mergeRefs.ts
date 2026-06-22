// export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
//     return (node: T | null) => {
//         refs.forEach((ref) => {
//             if (!ref) return;
//
//             if (typeof ref === 'function') {
//                 ref(node);
//             } else {
//                 (ref as React.MutableRefObject<T | null>).current = node;
//             }
//         });
//     };
// }

/**
 * Merges multiple React refs into a single callback ref.
 *
 * Useful when several components need access to the same DOM node,
 * such as combining internal and forwarded refs.
 *
 * @example
 * <button ref={mergeRefs(localRef, forwardedRef)} />
 */
export function mergeRefs<T>(
    ...refs: Array<React.Ref<T> | null | undefined>
): React.RefCallback<T> {
    return (node) => {
        refs.forEach((ref) => {
            if (!ref) return;

            if (typeof ref === 'function') {
                ref(node);
            } else {
                ref.current = node;
            }
        });
    };
}
