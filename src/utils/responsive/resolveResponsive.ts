import { Breakpoint, Responsive, ResponsiveObject } from './types';

import { breakpointOrder } from './breakpoints';

export const isResponsiveObject = <T>(value: any): value is ResponsiveObject<T> => {
    return (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        ('base' in value ||
            'xs' in value ||
            'sm' in value ||
            'md' in value ||
            'lg' in value ||
            'xl' in value ||
            '2xl' in value)
    );
};

export const resolveResponsive = <T>(
    value: Responsive<T | undefined> | undefined,
    breakpoint: Breakpoint,
): T | undefined => {
    if (value == null || !isResponsiveObject<T>(value)) {
        return value as T | undefined;
    }

    let result: T | undefined;

    for (const bp of breakpointOrder) {
        const v = value[bp];

        if (v !== undefined) {
            result = v;
        }

        if (bp === breakpoint) {
            break;
        }
    }

    return result;
};
