import React from 'react';
import { Icon } from './Icon';

export const Image = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />

            <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />

            <path d="M21 16l-5-5-6 6-3-3-4 4" />
        </Icon>
    );
};
