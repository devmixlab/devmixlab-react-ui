import type { CSSProperties } from 'react';

/**
 * Ensures a tuple contains no duplicate values.
 *
 * Example:
 *   defineUniqueTuple(['a', 'b', 'c'])      ✅
 *   defineUniqueTuple(['a', 'b', 'a'])      ❌
 */
export type UniqueTuple<T extends readonly unknown[], Seen = never> = T extends readonly [
    infer Head,
    ...infer Tail,
]
    ? Head extends Seen
        ? never
        : UniqueTuple<Tail, Seen | Head>
    : unknown;

/**
 * Defines a tuple and validates that all entries are unique.
 *
 * Useful for runtime arrays that also act as type-safe sources of truth.
 */
export const defineUniqueTuple = <T extends readonly unknown[]>(arr: T & UniqueTuple<T>) => arr;

type CSSProp = keyof CSSProperties;

/**
 * Defines a tuple of valid CSS property names.
 *
 * Validates:
 *   - every item is a CSS property
 *   - no duplicate items exist
 *
 * Example:
 *   defineStyleProps(['width', 'height'])   ✅
 *   defineStyleProps(['foo'])               ❌
 *   defineStyleProps(['width', 'width'])    ❌
 */
export const defineStyleProps = <T extends readonly CSSProp[]>(arr: T & UniqueTuple<T>) => arr;

/**
 * Defines a tuple of valid property keys from a type.
 *
 * Validates:
 *   - every item is a key of T
 *   - no duplicate items exist
 *   - literal tuple types are preserved
 *
 * Useful when a runtime array should stay synchronized with
 * a TypeScript type and later be used for Pick, Omit,
 * prop extraction, splitting, etc.
 *
 * Example:
 *   defineKeys<BoxProps>()(['width', 'height'])   ✅
 *   defineKeys<BoxProps>()(['foo'])               ❌
 *   defineKeys<BoxProps>()(['width', 'width'])    ❌
 */
export function defineKeys<T>() {
    return <const K extends readonly (keyof T)[]>(keys: K & UniqueTuple<K>) => keys;
}

/**
 * Compile-time error when not all keys of T are present.
 *
 * Example:
 *   type Props = {
 *       foo: string;
 *       bar: string;
 *       baz: string;
 *   };
 *
 *   defineExactKeys<Props>()([
 *       'foo',
 *       'bar',
 *   ]);
 *
 * Error:
 *   {
 *     __error__: 'Missing keys';
 *     __missing__: 'baz';
 *   }
 */
type ExactKeysError<T, K extends readonly (keyof T)[]> =
    Exclude<keyof T, K[number]> extends never
        ? unknown
        : {
              __error__: 'Missing keys';
              __missing__: Exclude<keyof T, K[number]>;
          };

/**
 * Defines a tuple containing exactly all keys of a type.
 *
 * Validates:
 *   - every item is a key of T
 *   - no duplicate items exist
 *   - every key of T is present
 *   - no extra keys are allowed
 *   - literal tuple types are preserved
 *
 * Useful when a runtime array is intended to be the complete
 * source of truth for a type's keys.
 *
 * Example:
 *   type Props = {
 *       foo: string;
 *       bar: string;
 *   };
 *
 *   defineExactKeys<Props>()([
 *       'foo',
 *       'bar',
 *   ]);                                  ✅
 *
 *   defineExactKeys<Props>()([
 *       'foo',
 *   ]);                                  ❌ Missing key 'bar'
 *
 *   defineExactKeys<Props>()([
 *       'foo',
 *       'bar',
 *       'baz',
 *   ]);                                  ❌ 'baz' is not a key of Props
 *
 *   defineExactKeys<Props>()([
 *       'foo',
 *       'foo',
 *       'bar',
 *   ]);                                  ❌ Duplicate key
 */
export function defineExactKeys<T>() {
    return <const K extends readonly (keyof T)[]>(
        keys: K & UniqueTuple<K> & ExactKeysError<T, K>,
    ) => keys;
}
