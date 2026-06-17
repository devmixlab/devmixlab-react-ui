import React from 'react';
import { Icon } from './Icon';

export const ChevronDown = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="6 9 12 15 18 9" />
        </Icon>
    );
};
