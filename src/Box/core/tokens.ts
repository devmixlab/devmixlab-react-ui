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

export const radii = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
export type Radius = (typeof radii)[number];

export const fontSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export type FontSize = (typeof fontSizes)[number];

export const fontWeights = ['thin', 'light', 'normal', 'medium', 'semibold', 'bold'] as const;
export type FontWeight = (typeof fontWeights)[number];

export const lineHeights = ['tight', 'normal', 'relaxed'] as const;
export type LineHeights = (typeof lineHeights)[number];

export const letterSpacings = ['tight', 'normal', 'wide'] as const;
export type LetterSpacing = (typeof letterSpacings)[number];

export const borderWidths = ['none', 'thin', 'normal', 'thick'] as const;
export type BorderWidth = (typeof borderWidths)[number];

// export const spacingNumeric = ['0', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
// export type SpaceNumeric = (typeof spacingNumeric)[number];

export const spacing = ['0', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
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

export const aspects = ['1', '1/1', '16/9', '4/3', '3/2', '21/9'] as const;

export type AspectToken = keyof typeof aspects;

export const cursors = [
    'default',
    'pointer',
    'move',
    'text',
    'not-allowed',
    'grab',
    'grabbing',
] as const;

export const pointerEvents = ['auto', 'none'] as const;

export const positions = ['static', 'relative', 'absolute', 'fixed', 'sticky'] as const;

export const insets = ['0', 'auto', '1/2', 'full'] as const;

export const translates = ['0', '1/2', 'full', '-1/2', '-full'] as const;
export const scales = ['0', '50', '75', '90', '95', '100', '105', '110', '125', '150'] as const;
export const rotates = ['0', '45', '90', '180', '-45', '-90'] as const;

export const transitionDurations = ['fast', 'normal', 'slow'] as const;

export const transitionEasings = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out'] as const;
// export type TransitionEasing = (typeof transitionEasings)[number];
export const transitionEasingsMap: Record<string, (typeof transitionEasings)[number]> = {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
};

export const zIndexes = ['base', 'dropdown', 'sticky', 'overlay', 'modal', 'tooltip'] as const;

export const displays = ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'] as const;

// tokens.ts
export const overflows = ['auto', 'hidden', 'scroll', 'visible'] as const;

export const gaps = spacing; // reuse existing spacing tokens

// grid
export const grids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

export type Grid = (typeof grids)[number];

export const cols = grids;

export type Col = (typeof cols)[number];
