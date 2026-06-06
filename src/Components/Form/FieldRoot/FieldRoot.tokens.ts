import type { BoxProps } from '../../Box';
import { defineExactKeys, defineUniqueTuple } from '../../../types/tuple';
import { SharedFieldRootProps } from './FieldRoot';

const shareFieldRootPropKeys = defineExactKeys<SharedFieldRootProps>()([
    'start',
    'end',
    'actions',
    'controls',

    'variant',
    'size',

    'disabled',
    'readOnly',
    'invalid',
    'active',
]);

const fieldLayoutPropKeys = [
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

type FieldLayoutProp = (typeof fieldLayoutPropKeys)[number];

type FieldLayoutProps = Pick<BoxProps, FieldLayoutProp>;

const fieldRootPropKeys = defineUniqueTuple([
    ...fieldLayoutPropKeys,
    ...shareFieldRootPropKeys,
] as const);

export type { FieldLayoutProps, FieldLayoutProp };

export { fieldLayoutPropKeys, shareFieldRootPropKeys, fieldRootPropKeys };
