import React from 'react';
import { Icon } from './Icon';

export const Close = (props: React.ComponentProps<typeof Icon>) => (
    <Icon {...props}>
        <path d="M19 5L5 19" />
        <path d="M5 5l14 14" />
    </Icon>
);
