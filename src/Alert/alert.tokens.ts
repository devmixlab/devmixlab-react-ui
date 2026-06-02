import { Density } from '../Components/Card/card.tokens';

export type Intent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type Variant = 'base' | 'solid' | 'outlined' | 'subtle';

export type Size = 'sm' | 'md' | 'lg';

export const sizeToDensityMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const satisfies Record<Size, Density>;
