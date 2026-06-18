import React from 'react';
import { Icon } from './Icon';

export const ChevronLeft = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="15 18 9 12 15 6" />
        </Icon>
    );
};
