import React from 'react';
import { Icon } from './Icon';

export const Video = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <rect x="3" y="6" width="13" height="12" rx="2" />

            <path d="M16 10l5-3v10l-5-3z" />

            <path d="M9 10l4 2-4 2z" fill="currentColor" stroke="none" />
        </Icon>
    );
};
