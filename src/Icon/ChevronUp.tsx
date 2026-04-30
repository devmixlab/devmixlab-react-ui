import React from 'react';
import { Icon } from './Icon';

export const ChevronUp = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="6 15 12 9 18 15" />
        </Icon>
    );
};
