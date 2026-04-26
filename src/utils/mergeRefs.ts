export function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
    return (node: T) => {
        refs.forEach((ref) => {
            if (!ref) return;

            if (typeof ref === 'function') {
                ref(node);
            } else {
                (ref as React.MutableRefObject<T | null>).current = node;
            }
        });
    };
}
