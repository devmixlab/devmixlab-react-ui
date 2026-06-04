/**
 * Splits an object into two objects:
 *   - extracted: contains matching keys from the provided key list
 *   - rest: contains all remaining properties
 *
 * Only keys that actually exist on the source object are extracted.
 *
 * Useful for separating component props into groups:
 *
 * Example:
 *   const [fieldRootProps, inputProps] = splitProps(
 *       props,
 *       [...fieldLayoutProps, ...shareFieldRootProps],
 *   );
 *
 *   <FieldRoot {...fieldRootProps}>
 *       <input {...inputProps} />
 *   </FieldRoot>
 *
 * Type behavior:
 *   - keys are not required to exist on T
 *   - non-existent keys are ignored
 *   - extracted type contains only keys present on T
 *   - rest type excludes extracted keys
 */
export function splitProps<
    T extends Record<PropertyKey, any>,
    const K extends readonly PropertyKey[],
>(props: T, keys: K) {
    type ExtractedKeys = Extract<K[number], keyof T>;

    const extracted = {} as Pick<T, ExtractedKeys>;
    const rest = { ...props } as Omit<T, ExtractedKeys>;

    for (const key of keys) {
        if (key in props) {
            const typedKey = key as ExtractedKeys;

            extracted[typedKey] = props[typedKey];
            delete (rest as Record<PropertyKey, unknown>)[key];
        }
    }

    return [extracted, rest] as const;
}
