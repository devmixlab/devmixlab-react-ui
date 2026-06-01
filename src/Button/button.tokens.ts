export type LoadingPosition = 'start' | 'center' | 'end';

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Size = (typeof sizes)[number];

export type BuiltinVariant = 'base' | 'solid' | 'outlined' | 'subtle' | 'ghost' | 'link';

export type Variant = BuiltinVariant | (string & {});

export type BuiltinIntent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type Intent = BuiltinIntent | (string & {});
