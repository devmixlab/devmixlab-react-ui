export const sizes = ['sm', 'md', 'lg'] as const;
export type Size = (typeof sizes)[number];
