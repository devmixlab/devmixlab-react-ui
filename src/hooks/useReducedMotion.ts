import { useEffect, useState } from 'react';

/**
 * Tracks the user's OS/browser reduced motion preference.
 *
 * Returns `true` when:
 *   prefers-reduced-motion: reduce
 */
export function useReducedMotion(): boolean {
    const getInitialValue = () => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    const [reducedMotion, setReducedMotion] = useState(getInitialValue);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleChange = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        setReducedMotion(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    return reducedMotion;
}
