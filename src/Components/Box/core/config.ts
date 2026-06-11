import {
    alignItems as alignItemsTokens,
    aspects as aspectsTokens,
    borderWidths as borderWidthsTokens,
    colors as colorsTokens,
    cursors as cursorsTokens,
    displays as displaysTokens,
    flexDirections as flexDirectionsTokens,
    flexWraps as flexWrapsTokens,
    fontSizes as fontSizesTokens,
    fontWeights as fontWeightsTokens,
    gaps as gapsTokens,
    insets as insetsTokens,
    justifyContents as justifyContentsTokens,
    letterSpacings as letterSpacingsTokens,
    textAlignments as textAlignmentsTokens,
    textTransforms as textTransformsTokens,
    textDecorations as textDecorationsTokens,
    whiteSpaces as whiteSpacesTokens,
    textOverflows as textOverflowsTokens,
    wordBreaks as wordBreaksTokens,
    overflowWraps as overflowWrapsTokens,
    overflowWrapsMap,
    opacities as opacitiesTokens,
    fontStyles as fontStylesTokens,
    lineHeights as lineHeightsTokens,
    overflows as overflowsTokens,
    pointerEvents as pointerEventsTokens,
    positions as positionsTokens,
    radii as radiiTokens,
    shadows as shadowsTokens,
    sizes as sizesTokens,
    spacing as spacingTokens,
    transitionDurations as transitionDurationsTokens,
    transitionEasings as transitionEasingsTokens,
    transitionEasingsMap,
    transitionProperties as transitionPropertiesTokens,
    zNumberIndexes,
    zIndexes as zIndexesTokens,
    grids as gridsTokens,
    cols as colsTokens,
    insetsMap,
    whiteSpacesMap,
    wordBreaksMap,
    textDecorationsMap,
    visibilities as visibilitiesTokens,
    userSelects as userSelectsTokens,
    objectFits as objectFitsTokens,
    borderStyles as borderStylesTokens,
    selfAlignments as selfAlignmentsTokens,
} from './tokens';
import { Props } from '../Box';
import { StyleAliasKey, stylePropToAliasMap } from './styleAliasMap';

type customKey = 'lineClamp' | 'truncate';
type Key = keyof Props | customKey;

export type PropValue = boolean | number | string | undefined;

type ResolveInStyleProps = { value: PropValue };

export type Check = {
    props: Props;
    key: Key;
    value: PropValue;
};

type CssVarTuple = readonly [string, string];

export type OriginPropConfig = {
    key: Key;
    prefix?: string;
    useJustPrefix?: boolean;
    setCssVars?: readonly CssVarTuple[];
    map?: Record<string, string | number>;
    tokens?: readonly string[];
    check?: (props: Check) => boolean;
    resolveInStyle?: (props: ResolveInStyleProps) => string | number;
    isToken?: (isT: () => boolean, value: PropValue) => value is PropValue;
    modifyValue?: (value: PropValue) => PropValue;
};

type SpacingProp = {
    key: Key;
    alias: StyleAliasKey;
};

export const spacingProps: SpacingProp[] = (
    [
        'padding',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'paddingInline',
        'paddingBlock',

        'margin',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'marginInline',
        'marginBlock',
    ] as const
).map((key) => ({
    key,
    alias: stylePropToAliasMap[key],
}));

export const rotateMap = {
    xs: '5deg',
    sm: '15deg',
    md: '45deg',
    lg: '90deg',
    xl: '180deg',
} as const;

export const resolveTransformRotate = (value: unknown): string => {
    // 1. semantic tokens (with optional minus)
    if (typeof value === 'string') {
        const isNegative = value.startsWith('-');
        const key = isNegative ? value.slice(1) : value;

        if (key in rotateMap) {
            const base = rotateMap[key as keyof typeof rotateMap];
            return isNegative ? `-${base}` : base;
        }
    }

    // 2. number → deg
    if (typeof value === 'number') {
        return `${value}deg`;
    }

    // 3. string with unit (deg, rad, turn, etc.)
    if (typeof value === 'string' && /[a-z%]+$/i.test(value)) {
        return value;
    }

    // 4. numeric string → deg
    const num = Number(value);
    if (!Number.isNaN(num)) {
        return `${num}deg`;
    }

    // 5. fallback
    return String(value);
};

export const scaleMap = {
    xs: 0.75,
    sm: 0.875,
    md: 1,
    lg: 1.25,
    xl: 1.5,
} as const;

export const resolveTransformScale = (value: unknown): string => {
    if (typeof value === 'string') {
        const isNegative = value.startsWith('-');
        const key = isNegative ? value.slice(1) : value;

        // 1. semantic tokens
        if (key in scaleMap) {
            const base = scaleMap[key as keyof typeof scaleMap];
            return String(isNegative ? -base : base);
        }

        // 2. numeric string
        const num = Number(value);
        if (!Number.isNaN(num)) {
            const normalized = num > 10 ? num / 100 : num;
            return String(normalized);
        }

        // 3. fallback
        return value;
    }

    // 4. number
    if (typeof value === 'number') {
        return String(value > 10 ? value / 100 : value);
    }

    return String(value);
};

export const resolveTransformTranslate = (v: string) => {
    switch (v) {
        case '1/2':
            return '50%';
        case '-1/2':
            return '-50%';
        case 'full':
            return '100%';
        case '-full':
            return '-100%';
        default:
            return v;
    }
};

const widthsPrefixes = new Set(['w', 'min-w', 'max-w']);

export const config: OriginPropConfig[] = [
    { key: 'boxShadow', prefix: 'shadow', tokens: shadowsTokens },

    // Rounding
    ...(
        [
            ['borderRadius', 'rounded'],
            ['borderTopLeftRadius', 'rounded-top-left'],
            ['borderTopRightRadius', 'rounded-top-right'],
            ['borderBottomLeftRadius', 'rounded-bottom-left'],
            ['borderBottomRightRadius', 'rounded-bottom-right'],

            ['roundedLeft', 'rounded-left'],
            ['roundedTop', 'rounded-top'],
            ['roundedRight', 'rounded-right'],
            ['roundedBottom', 'rounded-bottom'],
        ] as const
    ).map(([key, prefix]) => ({
        key: key,
        prefix: prefix ?? key,
        tokens: gapsTokens,
    })),

    { key: 'borderRadius', prefix: 'rounded', tokens: radiiTokens },

    // Typography
    { key: 'fontSize', prefix: 'fs', tokens: fontSizesTokens },
    { key: 'fontWeight', prefix: 'fw', tokens: fontWeightsTokens },
    { key: 'lineHeight', prefix: 'lh', tokens: lineHeightsTokens },
    { key: 'letterSpacing', prefix: 'ls', tokens: letterSpacingsTokens },

    { key: 'textAlign', prefix: 'text', tokens: textAlignmentsTokens },
    { key: 'textTransform', prefix: 'text', tokens: textTransformsTokens },
    {
        key: 'textDecoration',
        prefix: 'text-decoration',
        map: textDecorationsMap,
        tokens: textDecorationsTokens,
    },
    { key: 'whiteSpace', prefix: 'ws', map: whiteSpacesMap, tokens: whiteSpacesTokens },
    { key: 'textOverflow', prefix: 'text-overflow', tokens: textOverflowsTokens },
    { key: 'wordBreak', prefix: 'break', map: wordBreaksMap, tokens: wordBreaksTokens },
    {
        key: 'overflowWrap',
        prefix: 'overflow-wrap',
        map: overflowWrapsMap,
        tokens: overflowWrapsTokens,
    },
    { key: 'fontStyle', prefix: 'font', tokens: fontStylesTokens },
    {
        key: 'opacity',
        tokens: opacitiesTokens,
        isToken: (isT: () => boolean, value: PropValue): value is string => {
            return (
                (typeof value === 'number' &&
                    (opacitiesTokens as readonly string[]).includes(String(value))) ||
                isT()
            );
        },
    },

    { key: 'visibility', tokens: visibilitiesTokens },
    { key: 'userSelect', prefix: 'select', tokens: userSelectsTokens },
    { key: 'objectFit', prefix: 'object', tokens: objectFitsTokens },
    { key: 'borderStyle', prefix: 'border', tokens: borderStylesTokens },
    { key: 'alignSelf', prefix: 'self', tokens: selfAlignmentsTokens },

    { key: 'borderWidth', prefix: 'bw', tokens: borderWidthsTokens },

    // Flex
    { key: 'flexDirection', prefix: 'dir', tokens: flexDirectionsTokens },
    { key: 'justifyContent', prefix: 'justify', tokens: justifyContentsTokens },
    { key: 'alignItems', prefix: 'align', tokens: alignItemsTokens },
    {
        key: 'flexWrap',
        prefix: 'wrap',
        tokens: flexWrapsTokens,
        modifyValue: (value: PropValue) => {
            return value === true ? 'wrap' : value;
        },
    },

    { key: 'aspectRatio', prefix: 'aspect', tokens: aspectsTokens },

    // Cursor & Pointer Events
    { key: 'cursor', prefix: 'cursor', tokens: cursorsTokens },
    { key: 'pointerEvents', prefix: 'ptr', tokens: pointerEventsTokens },

    // Transition
    {
        key: 'transD',
        prefix: 'trans-d',
        tokens: transitionDurationsTokens,
        check: ({ props }) => {
            return !props || props['transition'] === undefined;
        },
    },
    {
        key: 'transE',
        prefix: 'trans-e',
        tokens: transitionEasingsTokens,
        map: transitionEasingsMap,
        check: ({ props }) => {
            return !props || props['transition'] === undefined;
        },
    },
    {
        key: 'transP',
        prefix: 'trans-p',
        tokens: transitionPropertiesTokens,
        check: ({ props }) => {
            return !props || props['transition'] === undefined;
        },
    },

    // Others
    {
        key: 'zIndex',
        prefix: 'z',
        tokens: zIndexesTokens,
        modifyValue: (value: PropValue) => {
            return typeof value === 'number' &&
                (zNumberIndexes as readonly number[]).includes(value)
                ? String(value)
                : value;
        },
    },
    { key: 'display', prefix: 'd', tokens: displaysTokens },

    // Transform
    ...(
        [
            ...(['tx', 'ty'] as const).map((k) => ({
                key: k,
                resolveInStyle: ({ value }: ResolveInStyleProps) => {
                    return isNonEmptyString(value)
                        ? resolveTransformTranslate(value)
                        : String(value);
                },
            })),
            ...(['scale', 'scaleX', 'scaleY'] as const).map((k) => ({
                key: k,
                resolveInStyle: ({ value }: ResolveInStyleProps) => {
                    return isNonEmptyString(value) ? resolveTransformScale(value) : String(value);
                },
            })),
            {
                key: 'rotate',
                resolveInStyle: ({ value }: ResolveInStyleProps) => resolveTransformRotate(value),
            },
            ...(['flip', 'flipX', 'flipY'] as const).map((key) => {
                const utility = key.replace('flip', 'scale');
                return {
                    key,
                    resolveInStyle: () => `${utility}(-1)`,
                    check: ({ value }: Check) => !!value,
                };
            }),
        ] as const
    ).map((c: OriginPropConfig) => {
        const newConfig = { ...c };
        newConfig.check = (check: Check) => {
            const configCheck = c.check ? c.check(check) : true;
            return check.props?.transform === undefined && configCheck;
        };
        return newConfig;
    }),

    // Gaps
    ...([['gap'], ['rowGap', 'row-gap'], ['columnGap', 'col-gap']] as const).map(
        ([key, prefix]) => ({
            key: key,
            prefix: prefix ?? key,
            tokens: gapsTokens,
            isToken: (isT: () => boolean, value: PropValue): value is string => {
                return typeof value === 'number' || isT();
            },
        }),
    ),

    // Colors
    ...(
        [
            ['backgroundColor', 'bg'],
            ['borderColor', 'bc'],
            ['color', 'c'],
        ] as const
    ).map(([key, prefix]) => ({
        key: key,
        prefix,
        tokens: colorsTokens,
    })),

    // Positioning
    { key: 'position', prefix: 'pos', tokens: positionsTokens },
    ...([['top'], ['left'], ['right'], ['bottom']] as const).map(([key]) => ({
        key: key,
        tokens: insetsTokens,
        map: insetsMap,
        modifyValue: (value: PropValue) => {
            return value === 0 ? '0' : value;
        },
    })),

    // Overflow
    ...(
        [
            ['overflow', 'ov'],
            ['overflowX', 'ov-x'],
            ['overflowY', 'ov-y'],
        ] as const
    ).map(([key, prefix]) => ({
        key: key,
        prefix,
        tokens: overflowsTokens,
    })),

    // Spacing
    ...spacingProps.map(({ key, alias }) => ({
        key: key,
        prefix: alias,
        tokens: spacingTokens,
        isToken: (isT: () => boolean, value: PropValue): value is string => {
            return typeof value === 'number' || isT();
        },
    })),

    // Line Clamp
    {
        key: 'lineClamp',
        useJustPrefix: true,
        setCssVars: [['--line-clamp', '{token}']],
        prefix: 'line-clamp',
        isToken: (isT: () => boolean, value: PropValue): value is number => {
            return typeof value === 'number';
        },
    },

    // Truncate
    {
        key: 'truncate',
        useJustPrefix: true,
        // setCssVars: [['--line-clamp', '{token}']],
        // prefix: 'line-clamp',
        isToken: (isT: () => boolean, value: PropValue): value is boolean => {
            return typeof value === 'boolean';
        },
    },

    // Sizing
    ...(
        [
            ['width', 'w'],
            ['height', 'h'],
            ['minWidth', 'min-w'],
            ['maxWidth', 'max-w'],
            ['minHeight', 'min-h'],
            ['maxHeight', 'max-h'],
        ] as const
    ).map(([key, prefix]) => ({
        key: key,
        prefix,
        tokens: sizesTokens,
        modifyValue: (value: PropValue) => {
            if (value !== 'screen') return value;
            return widthsPrefixes.has(prefix) ? 'screen-w' : 'screen-h';
        },
        isToken: (isT: () => boolean, value: PropValue): value is string => {
            return value === 'screen-w' || value === 'screen-h' || isT();
        },
    })),

    // Grid
    {
        key: 'grid',
        prefix: 'grid',
        tokens: gridsTokens,
        isToken: (isT: () => boolean, value: PropValue): value is string => {
            return typeof value === 'number' || isT();
        },
        modifyValue: (value: PropValue) => {
            return value === true ? 12 : value;
        },
    },

    // Grid column
    {
        key: 'col',
        prefix: 'col',
        tokens: colsTokens,
        isToken: (isT: () => boolean, value: PropValue): value is string => {
            return typeof value === 'number' || isT();
        },
    },
];

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

const isToken = (value: PropValue, tokens?: readonly string[]): value is string => {
    if (tokens == undefined) return false;
    return typeof value === 'string' && tokens.includes(value);
};

export type MapedPropConfig = Omit<OriginPropConfig, 'prefix' | 'tokens' | 'isToken'> & {
    prefix: string;
    alias?: StyleAliasKey;
    isToken: (value: PropValue) => value is string;
};

export type LookupKey = Key | StyleAliasKey;

export const configLookup: Record<LookupKey, MapedPropConfig> = Object.fromEntries(
    config.flatMap(
        ({
            key,
            prefix,
            useJustPrefix,
            setCssVars,
            map,
            tokens,
            check,
            resolveInStyle,
            isToken: configIsToken,
            modifyValue,
        }) => {
            const alias = stylePropToAliasMap[key as keyof typeof stylePropToAliasMap];

            const mappedProp: MapedPropConfig = Object.freeze({
                key,
                prefix: prefix ?? key,
                useJustPrefix,
                map,
                check,
                resolveInStyle,
                setCssVars,
                isToken: (value: PropValue): value is string => {
                    const isT = () => isToken(value, tokens);
                    return configIsToken ? configIsToken(isT, value) : isT();
                },
                modifyValue,
                ...(alias !== undefined && { alias }),
            });

            return [[key, mappedProp], ...(alias !== undefined ? [[alias, mappedProp]] : [])];
        },
    ),
);
