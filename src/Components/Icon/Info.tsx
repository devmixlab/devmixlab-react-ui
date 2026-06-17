import React from 'react';
import { Icon } from './Icon';

export const Info = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v4" strokeLinecap="round" />
            <circle cx="12" cy="7.5" r="0.75" fill="currentColor" />
        </Icon>
    );
};
