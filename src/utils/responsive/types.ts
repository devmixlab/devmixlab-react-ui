export type Breakpoint = 'base' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveObject<T> = {
    base?: T;
    '2xs'?: T;
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
};

export type Responsive<T> = T | ResponsiveObject<T>;

export type Responsiveify<T> = {
    [K in keyof T]?: Responsive<T[K]>;
};
