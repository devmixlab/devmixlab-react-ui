export const semanticColors = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
] as const;

export const extendedColors = [
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
] as const;

export const colors = [...semanticColors, ...extendedColors] as const;

export type SemanticColor = (typeof semanticColors)[number];
export type ExtendedColor = (typeof extendedColors)[number];
export type Color = (typeof colors)[number];

export const shadows = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
export type Shadow = (typeof shadows)[number];

export const radii = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export type Radius = (typeof radii)[number];

export const fontSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export type FontSize = (typeof fontSizes)[number];

export const fontWeights = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold'] as const;
export type FontWeight = (typeof fontWeights)[number];

export const lineHeights = ['tight', 'snug', 'normal', 'relaxed', 'loose'] as const;
export type LineHeights = (typeof lineHeights)[number];

export const letterSpacings = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'] as const;
export type LetterSpacing = (typeof letterSpacings)[number];

export const borderWidths = ['none', 'hairline', 'thin', 'normal', 'thick', 'heavy'] as const;
export type BorderWidth = (typeof borderWidths)[number];

export const spacing = [
    '0',
    '2xs',
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
] as const;
export type Space = (typeof spacing)[number];

export const flexDirections = ['row', 'row-reverse', 'column', 'column-reverse'] as const;
export const justifyContents = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
export const alignItems = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
export const flexWraps = ['nowrap', 'wrap', 'wrap-reverse'] as const;

// tokens.ts
export const sizes = [
    'full',
    'screen',
    '1/2',
    '1/3',
    '2/3',
    '1/4',
    '3/4',
    '1/5',
    '1/10',
    '2/5',
    '3/5',
    '4/5',
] as const;

export const aspects = ['1', '1/1', '16/9', '4/3', '3/2', '9/16', '21/9'] as const;

export type AspectToken = keyof typeof aspects;

export const cursors = [
    'default',
    'auto',
    'pointer',
    'move',
    'text',
    'not-allowed',
    'grab',
    'grabbing',
] as const;

export const pointerEvents = ['auto', 'none'] as const;

export const positions = ['static', 'relative', 'absolute', 'fixed', 'sticky'] as const;

export const insets = [
    '0',
    'auto',

    '1/4',
    '1/2',
    '3/4',

    'full',

    '-1/4',
    '-1/2',
    '-3/4',

    '-full',
] as const;

export const insetsMap: Record<string, (typeof insets)[number]> = {
    '25%': '1/4',
    '50%': '1/2',
    '75%': '3/4',
    '100%': 'full',
    '-25%': '-1/4',
    '-50%': '-1/2',
    '-75%': '-3/4',
    '-100%': '-full',
};

export const translates = ['0', '1/2', 'full', '-1/2', '-full'] as const;
export const scales = ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150'] as const;
export const rotates = ['0', '45', '90', '180', '-45', '-90'] as const;

export const transitionDurations = ['fast', 'normal', 'slow'] as const;

export const transitionEasings = [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'standard',
    'enter',
    'exit',
    'emphasized',
] as const;
// export type TransitionEasing = (typeof transitionEasings)[number];
export const transitionEasingsMap: Record<string, (typeof transitionEasings)[number]> = {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
};

export const transitionProperties = [
    'all',
    'opacity',
    'transform',
    'color',
    'bg',
    'shadow',
    'border',
    'size',
    'position',
] as const;

// export const transitionPropertiesMap = {
//     all: 'all',
//     opacity: 'opacity',
//     transform: 'transform',
//     color: 'color',
//     bg: 'background-color',
//     shadow: 'box-shadow',
//     border: 'border-color',
//     size: 'width, height',
//     position: 'top, left, right, bottom',
// } as const;

export const zNumberIndexes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const;

export const zTokenIndexes = ['base', 'dropdown', 'sticky', 'overlay', 'modal', 'tooltip'] as const;

export const zIndexes = [...zNumberIndexes.map(String), ...zTokenIndexes] as const;

export const displays = ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] as const;

// tokens.ts
export const overflows = ['auto', 'hidden', 'scroll', 'visible'] as const;

export const gaps = spacing; // reuse existing spacing tokens

// grid
export const grids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

export type Grid = (typeof grids)[number];

export const cols = grids;

export type Col = (typeof cols)[number];

// Typography
export const textAlignments = ['left', 'center', 'right', 'justify'] as const;

export const textTransforms = ['uppercase', 'lowercase', 'capitalize', 'normal'] as const;

export const textDecorations = ['none', 'underline', 'overline', 'line-through'] as const;
export const textDecorationsMap: Record<string, (typeof textDecorations)[number]> = {
    lineThrough: 'line-through',
};

export const whiteSpaces = ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'] as const;
export const whiteSpacesMap: Record<string, (typeof whiteSpaces)[number]> = {
    preWrap: 'pre-wrap',
    preLine: 'pre-line',
};

export const textOverflows = ['clip', 'ellipsis'] as const;

export const wordBreaks = ['normal', 'break-all', 'keep-all', 'break-word'] as const;
export const wordBreaksMap: Record<string, (typeof wordBreaks)[number]> = {
    breakAll: 'break-all',
    keepAll: 'keep-all',
    breakWord: 'break-word',
};

export const overflowWraps = ['normal', 'break-word', 'anywhere'] as const;
export const overflowWrapsMap: Record<string, (typeof overflowWraps)[number]> = {
    breakWord: 'break-word',
};

export const fontStyles = ['normal', 'italic', 'oblique'] as const;
