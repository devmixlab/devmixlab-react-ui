import React from 'react';
import { Icon } from './Icon';

export const Audio = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <path d="M11 5v14" />

            <path d="M11 5l6 2" />

            <circle cx="9" cy="18" r="2" />

            <circle cx="17" cy="16" r="2" />

            <path d="M17 7v9" />
        </Icon>
    );
};
