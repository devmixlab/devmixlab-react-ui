import { CSSProperties } from 'react';
import { classPrefix } from '../../utils/classPrefix';

export const prefix = (name: string = '') => {
    return classPrefix(`--box${name}`);
};

const spacing: Record<number, number> = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
};

export const breakpoints = {
    base: 0,
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
};

export const getActiveBreakpoint = (width: number) => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    if (width >= breakpoints.xs) return 'xs';
    return 'base';
};

// const resolved: Record<string, any> = {};
//
// export const get = <T, R = T>(
//     key: string,
//     value: T | undefined,
//     modify?: (v: T) => R,
// ): R | undefined => {
//     const cacheKey = `${key}_${bp}`; // unique per prop + breakpoint
//     if (resolved[cacheKey] !== undefined) return resolved[cacheKey];
//
//     const result = resolveResponsive(value, bp, modify);
//     resolved[cacheKey] = result;
//     return result;
// };

// const resolved: Record<string, any> = {};
//
// export const get = <T, R = T>(
//     key: string,
//     value: Responsive<T | undefined> | undefined,
//     bp: keyof typeof breakpoints | 'base',
//     modify?: (v: T) => R,
// ): R | undefined => {
//     const cacheKey = `${key}_${bp}`;
//     if (cacheKey in resolved) return resolved[cacheKey];
//
//     if (key === 'columnSpan') {
//         console.log('columnSpan');
//         console.log(value);
//         console.log(bp);
//     }
//     const result = resolveResponsive(value, bp, modify);
//     resolved[cacheKey] = result;
//     return result;
// };

// export type ResponsiveObj<T> = {
//     base?: T;
//     xs?: T;
//     sm?: T;
//     md?: T;
//     lg?: T;
//     xl?: T;
//     '2xl'?: T;
// };
//
// export type Responsive<T> = T | ResponsiveObj<T>;

// export type Responsive<T> =
//     | T
//     | {
//           base?: T;
//           xs?: T;
//           sm?: T;
//           md?: T;
//           lg?: T;
//           xl?: T;
//           '2xl'?: T;
//       };

export type ResponsiveObject<T> = { base?: T; xs?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T };

export type Responsive<T> = T | ResponsiveObject<T>;

export const isResponsiveObject = <T>(value: any): value is ResponsiveObject<T> => {
    return (
        value &&
        typeof value === 'object' &&
        ('base' in value ||
            'xs' in value ||
            'sm' in value ||
            'md' in value ||
            'lg' in value ||
            'xl' in value ||
            '2xl' in value)
    );
};

// type ResponsiveValue = Responsive<number | string>;
// export const getResponsiveClasses = (value?: ResponsiveValue, p: string) => {
//     if (value === undefined) return '';
//
//     // p = prefix(p);
//
//     if (typeof value !== 'object') {
//         return classPrefix(`--${p}${value}`);
//     }
//
//     return [
//         value.base !== undefined && classPrefix(`--base:${p}${value.base}`),
//         value.xs !== undefined && classPrefix(`--xs:${p}${value.xs}`),
//         value.sm !== undefined && classPrefix(`--sm:${p}${value.sm}`),
//         value.md !== undefined && classPrefix(`--md:${p}${value.md}`),
//         value.lg !== undefined && classPrefix(`--lg:${p}${value.lg}`),
//         value.xl !== undefined && classPrefix(`--xl:${p}${value.xl}`),
//         value['2xl'] !== undefined && classPrefix(`--2xl:${p}${value['2xl']}`),
//     ]
//         .filter(Boolean)
//         .join(' ');
// };

// const resolveResponsive = <T>(value: Responsive<T> | undefined): T | undefined => {
//     if (value == null || typeof value !== 'object') {
//         return value as T;
//     }
//
//     const width = window.innerWidth;
//
//     if (width >= breakpoints.lg && value.lg !== undefined) return value.lg;
//     if (width >= breakpoints.md && value.md !== undefined) return value.md;
//     if (width >= breakpoints.sm && value.sm !== undefined) return value.sm;
//
//     return undefined;
// };

// export const resolveResponsive = <T>(value: Responsive<T> | undefined): T | undefined => {
//     if (!isResponsiveObject<T>(value)) {
//         return value as T;
//     }
//
//     const width = window.innerWidth;
//
//     if (width >= breakpoints['2xl'] && value['2xl'] !== undefined) return value['2xl'];
//     if (width >= breakpoints.xl && value.xl !== undefined) return value.xl;
//     if (width >= breakpoints.lg && value.lg !== undefined) return value.lg;
//     if (width >= breakpoints.md && value.md !== undefined) return value.md;
//     if (width >= breakpoints.sm && value.sm !== undefined) return value.sm;
//     if (width >= breakpoints.xs && value.xs !== undefined) return value.xs;
//
//     return undefined;
// };

// export const resolveResponsive = <T, R = T>(
//     value: Responsive<T> | undefined,
//     width: number,
//     modify?: (value: T) => R,
// ): R | undefined => {
//     if (!isResponsiveObject<T>(value)) {
//         if (value === undefined) return undefined;
//         return modify ? modify(value) : (value as R);
//     }
//
//     const breakpointsOrder: (keyof typeof value)[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
//
//     let result: R | undefined = undefined;
//
//     for (const bp of breakpointsOrder) {
//         if (value[bp] !== undefined) {
//             const minWidth = breakpoints[bp as keyof typeof breakpoints] ?? 0;
//             if (width >= minWidth) result = (modify?.(value[bp]) ?? value[bp]) as R;
//         }
//     }
//
//     return result;
// };

// export const resolveResponsive = <T, R = T>(
//     value: Responsive<T | undefined> | undefined,
//     width: number,
//     modify?: (value: T) => R,
// ): R | undefined => {
//     // primitive or single value
//     if (!isResponsiveObject<T>(value)) {
//         if (value === undefined) return undefined;
//         return modify ? modify(value as T) : (value as R);
//     }
//
//     const breakpointsOrder: (keyof typeof value)[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
//
//     let result: R | undefined = undefined;
//
//     for (const bp of breakpointsOrder) {
//         if (value[bp] !== undefined) {
//             const minWidth = breakpoints[bp as keyof typeof breakpoints] ?? 0;
//             if (width >= minWidth) result = (modify?.(value[bp] as T) ?? (value[bp] as T)) as R;
//         }
//     }
//
//     return result;
// };

// export const resolveResponsive = <T, R = T>(
//     value: Responsive<T | undefined> | undefined,
//     bp: keyof typeof breakpoints | 'base',
//     modify?: (value: T) => R,
// ): R | undefined => {
//     if (!isResponsiveObject<T>(value)) {
//         if (value === undefined) return undefined;
//         return modify ? modify(value as T) : (value as unknown as R);
//     }
//
//     const order: (keyof typeof value)[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
//
//     let result: R | undefined;
//
//     for (const key of order) {
//         const v = value[key];
//
//         if (v !== undefined) {
//             result = modify ? modify(v) : (v as unknown as R);
//         }
//
//         if (key === bp) break;
//     }
//
//     return result;
// };

export const resolveResponsive = <T>(
    value: Responsive<T | undefined> | undefined,
    bp: keyof typeof breakpoints | 'base',
): T | undefined => {
    if (value == null || !isResponsiveObject<T>(value)) {
        return value as T | undefined;
    }

    const order = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

    let result: T | undefined;

    for (const key of order) {
        const v = value[key];

        if (v !== undefined) {
            result = v;
        }

        if (key === bp) break;
    }

    return result;
};

// export const resolveSpace = (value?: number | string) => {
//     if (value === undefined) return undefined;
//     if (typeof value === 'number') return spacing[value as number] ?? value;
//     return value;
// };

// export const resolveSpace = (value?: Responsive<number | string>) => {
//     const v = resolveResponsive(value);
//     if (v === undefined) return undefined;
//
//     if (typeof v === 'number') return spacing[v] ?? v;
//     return v;
// };

export const toSize = (v: any) => (typeof v === 'number' ? `${v}px` : v);

// export const applySpacing = (style: CSSProperties, props: any) => {
//     const { p, px, py, pt, pb, pl, pr, m, mx, my, mt, mb, ml, mr } = props;
//
//     if (p !== undefined) style.padding = resolveSpace(p);
//     if (px !== undefined) style.paddingInline = resolveSpace(px);
//     if (py !== undefined) style.paddingBlock = resolveSpace(py);
//     if (pt !== undefined) style.paddingTop = resolveSpace(pt);
//     if (pb !== undefined) style.paddingBottom = resolveSpace(pb);
//     if (pl !== undefined) style.paddingLeft = resolveSpace(pl);
//     if (pr !== undefined) style.paddingRight = resolveSpace(pr);
//
//     if (m !== undefined) style.margin = resolveSpace(m);
//     if (mx !== undefined) style.marginInline = resolveSpace(mx);
//     if (my !== undefined) style.marginBlock = resolveSpace(my);
//     if (mt !== undefined) style.marginTop = resolveSpace(mt);
//     if (mb !== undefined) style.marginBottom = resolveSpace(mb);
//     if (ml !== undefined) style.marginLeft = resolveSpace(ml);
//     if (mr !== undefined) style.marginRight = resolveSpace(mr);
// };
