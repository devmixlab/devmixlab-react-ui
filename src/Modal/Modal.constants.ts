export const maxHeights = {
    xs: 'calc(100vh - 2rem)',
    sm: 'calc(100vh - 2.5rem)',
    md: 'calc(100vh - 3rem)',
    lg: 'calc(100vh - 4rem)',
    xl: 'calc(100vh - 5rem)',
    '2xl': 'calc(100vh - 6rem)',

    full: 'calc(100vh - 2rem)',
    fullscreen: '100vh',
} as const;

export const heights = {
    xs: 'auto',
    sm: 'auto',
    md: 'auto',
    lg: 'auto',
    xl: 'auto',
    '2xl': 'auto',

    full: 'calc(100vh - 2rem)',
    fullscreen: '100vh',
} as const;

export const maxWidths = {
    xs: '20rem',
    sm: '30rem',
    md: '40rem',
    lg: '50rem',
    xl: '64rem',
    '2xl': '80rem',

    full: 'calc(100vw - 2rem)',
    fullscreen: '100vw',
} as const;

export const widths = {
    xs: '100%',
    sm: '100%',
    md: '100%',
    lg: '100%',
    xl: '100%',
    '2xl': '100%',

    full: '100%',
    fullscreen: '100vw',
} as const;
