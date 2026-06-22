/**
 * Merges two React props objects into a single props object.
 *
 * Useful when multiple headless components need to contribute props
 * to the same DOM element (e.g. Navbar.Item + Popover.Trigger,
 * Menu.Item + Tooltip.Trigger, etc.).
 *
 * Event handlers with the same name are automatically composed
 * so that both handlers are executed in order:
 *
 * ```tsx
 * const props = mergeProps(
 *     { onClick: () => console.log('navbar') },
 *     { onClick: () => console.log('popover') },
 * );
 *
 * props.onClick();
 * // navbar
 * // popover
 * ```
 *
 * For non-event properties, values from the second object override
 * values from the first object, matching normal object spread behavior:
 *
 * ```tsx
 * mergeProps(
 *     { tabIndex: 0 },
 *     { tabIndex: -1 },
 * );
 *
 * // { tabIndex: -1 }
 * ```
 *
 * @param a - Base props object.
 * @param b - Props object that overrides and extends the base props.
 *
 * @returns A merged props object with composed event handlers.
 *
 * @example
 * ```tsx
 * <Button
 *     {...mergeProps(itemProps, triggerProps)}
 * />
 * ```
 */

export function mergeProps<T extends Record<string, any>, U extends Record<string, any>>(
    a: T,
    b: U,
): T & U {
    const result = { ...a, ...b } as Record<string, any>;

    for (const key of Object.keys(a)) {
        if (key.startsWith('on') && typeof a[key] === 'function' && typeof b[key] === 'function') {
            result[key] = (...args: any[]) => {
                a[key](...args);
                b[key](...args);
            };
        }
    }

    return result as T & U;
}

// export function mergeProps<T extends Record<string, any>, U extends Record<string, any>>(
//     a: T,
//     b: U,
// ): T & U {
//     const result = { ...a, ...b };
//
//     for (const key of Object.keys(a)) {
//         if (key.startsWith('on') && typeof a[key] === 'function' && typeof b[key] === 'function') {
//             result[key] = (...args: any[]) => {
//                 a[key](...args);
//                 b[key](...args);
//             };
//         }
//     }
//
//     return result;
// }
