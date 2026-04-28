import React from 'react';
import { Icon } from './Icon';

export const Close = (props: React.ComponentProps<typeof Icon>) => (
    <Icon {...props}>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
    </Icon>
);
