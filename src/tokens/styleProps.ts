import { defineStyleProps } from '../types/tuple';

export const styleProps = defineStyleProps([
    // 1. Layout
    'display',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'inset',
    'insetInline',
    'insetBlock',
    'zIndex',

    // 2. Flexbox
    'flex',
    'flexDirection',
    'flexWrap',
    'flexGrow',
    'flexShrink',
    'flexBasis',
    'justifyContent',
    'alignItems',
    'alignContent',
    'alignSelf',

    // 3. Grid
    'gridTemplateColumns',
    'gridTemplateRows',
    'gridTemplateAreas',
    'gridAutoFlow',
    'gridAutoRows',
    'gridAutoColumns',
    'gridColumn',
    'gridRow',
    'gridArea',
    'justifyItems',
    'justifySelf',
    'placeContent',
    'placeItems',
    'gap',
    'rowGap',
    'columnGap',

    // 4. Box model (spacing)
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'marginInline',
    'marginBlock',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'paddingInline',
    'paddingBlock',

    // 5. Sizing
    'width',
    'minWidth',
    'maxWidth',
    'height',
    'minHeight',
    'maxHeight',

    // 6. Typography
    'fontFamily',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'textAlign',
    'textTransform',
    'textDecoration',
    'whiteSpace',
    'textOverflow',
    'wordBreak',
    'overflowWrap',
    'color',

    // 7. Background
    'background',
    'backgroundColor',
    'backgroundImage',
    'backgroundSize',
    'backgroundPosition',
    'backgroundRepeat',
    'backgroundAttachment',
    'backgroundClip',
    'backgroundOrigin',

    // 8. Border
    'border',
    'borderWidth',
    'borderStyle',
    'borderColor',
    'borderRadius',
    'borderImage',
    'borderCollapse',

    // Radius
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',

    // Border logical radius (RTL support)
    'borderStartStartRadius',
    'borderStartEndRadius',
    'borderEndStartRadius',
    'borderEndEndRadius',

    // Border sides
    'borderTop',
    'borderBottom',
    'borderLeft',
    'borderRight',

    // Border logical sides (RTL support)
    'borderInlineStart',
    'borderInlineEnd',
    'borderBlockStart',
    'borderBlockEnd',

    // Border colors
    'borderTopColor',
    'borderBottomColor',
    'borderLeftColor',
    'borderRightColor',

    // Border logical colors (RTL support)
    'borderInlineStartColor',
    'borderInlineEndColor',
    'borderBlockStartColor',
    'borderBlockEndColor',

    // Border widths
    'borderTopWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRightWidth',

    // Border logical widths (RTL support)
    'borderInlineStartWidth',
    'borderInlineEndWidth',
    'borderBlockStartWidth',
    'borderBlockEndWidth',

    // Border styles
    'borderTopStyle',
    'borderBottomStyle',
    'borderLeftStyle',
    'borderRightStyle',

    // Border logical styles (RTL support)
    'borderInlineStartStyle',
    'borderInlineEndStyle',
    'borderBlockStartStyle',
    'borderBlockEndStyle',

    // Border image
    'borderImageSource',
    'borderImageSlice',
    'borderImageWidth',
    'borderImageOutset',
    'borderImageRepeat',

    // 9. Effects / visual
    'opacity',
    'boxShadow',
    'transform',
    'transformOrigin',
    'transition',
    'transitionProperty',
    'transitionDuration',
    'transitionTimingFunction',
    'transitionDelay',
    'filter',
    'backdropFilter',
    'willChange',

    // 10. Scroll / overflow
    'overflow',
    'overflowX',
    'overflowY',
    'scrollBehavior',
    'scrollSnapType',
    'scrollMargin',
    'scrollPadding',

    // 11. Interaction
    'cursor',
    'pointerEvents',
    'visibility',
    'userSelect',
    'resize',

    // 12. Media
    'objectFit',
    'objectPosition',
    'aspectRatio',
    'imageRendering',
] as const);

export type StyleProp = (typeof styleProps)[number];
