import { useEffect } from 'react';

type UseWindowBlurOptions = {
    active: boolean;
    onBlur: (event: FocusEvent) => void;
};

export const useWindowBlur = ({ active, onBlur }: UseWindowBlurOptions) => {
    useEffect(() => {
        if (!active) return;

        const handleBlur = (event: FocusEvent) => {
            onBlur(event);
        };

        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('blur', handleBlur);
        };
    }, [active, onBlur]);
};
