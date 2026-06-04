import type { BoxProps } from '../../Box';

export const fieldLayoutProps = [
    'display',

    'width',
    'minWidth',
    'maxWidth',

    'height',
    'minHeight',
    'maxHeight',

    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'marginInline',
    'marginBlock',

    'flex',
    'flexGrow',
    'flexShrink',
    'flexBasis',

    'alignSelf',

    'gridColumn',
    'gridRow',

    'borderRadius',

    // aliases
    'rounded',
    'd',

    'w',
    'minW',
    'maxW',

    'h',
    'minH',
    'maxH',

    'm',
    'mt',
    'mr',
    'mb',
    'ml',
    'mx',
    'my',

    'grow',
    'shrink',
    'basis',

    'gridCol',
] as const satisfies readonly (keyof BoxProps)[];

type FieldLayoutProp = (typeof fieldLayoutProps)[number];

// export type FieldLayoutProps = Pick<BoxProps, FieldLayoutProp>;
type TextInputStyleProps = Pick<BoxProps, FieldLayoutProp>;

export type { TextInputStyleProps };
