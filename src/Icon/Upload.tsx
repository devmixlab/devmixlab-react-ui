import React from 'react';
import { Icon } from './Icon';

export const Upload = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <path d="M12 16V6" />
            <path d="m8 10 4-4 4 4" />
            <path d="M5 18v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" />
        </Icon>
    );
};
