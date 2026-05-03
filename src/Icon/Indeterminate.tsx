import React from 'react';
import { Icon } from './Icon';

export const Indeterminate = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <line x1="5" y1="12" x2="19" y2="12" />
        </Icon>
    );
};
