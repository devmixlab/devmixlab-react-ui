import React from 'react';
import { Icon } from './Icon';

export const Eye = (props: React.ComponentProps<typeof Icon>) => (
    <Icon {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
    </Icon>
);
