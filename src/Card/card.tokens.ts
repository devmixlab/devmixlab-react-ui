// export const kinds = ['filled', 'solid', 'soft', 'outlined', 'ghost'] as const;
// export type Kind = (typeof kinds)[number];

export type BuiltinVariant = 'base';
export type Variant = BuiltinVariant | (string & {});

export type BuiltinIntent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type Intent = BuiltinIntent | (string & {});

export const density = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Density = (typeof density)[number];

export const densitySpacing = {
    xs: {
        header: { px: 'xs', py: '0' },
        body: { px: 'xs', py: 'xs' },
        footer: { px: 'xs', py: '0' },
        section: { px: 'xs', py: 'xs' },
    },
    sm: {
        header: { px: 'sm', py: 'xs' },
        body: { px: 'sm', py: 'sm' },
        footer: { px: 'sm', py: 'xs' },
        section: { px: 'sm', py: 'sm' },
    },
    md: {
        header: { px: 'md', py: 'sm' },
        body: { px: 'md', py: 'md' },
        footer: { px: 'md', py: 'sm' },
        section: { px: 'md', py: 'md' },
    },
    lg: {
        header: { px: 'lg', py: 'md' },
        body: { px: 'lg', py: 'lg' },
        footer: { px: 'lg', py: 'md' },
        section: { px: 'lg', py: 'lg' },
    },
    xl: {
        header: { px: 'xl', py: 'lg' },
        body: { px: 'xl', py: 'xl' },
        footer: { px: 'xl', py: 'lg' },
        section: { px: 'xl', py: 'xl' },
    },
} as const;
