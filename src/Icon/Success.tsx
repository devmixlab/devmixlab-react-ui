import React from 'react';
import { Icon } from './Icon';

export const Success = (props: React.ComponentProps<typeof Icon>) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
);
