import React from 'react';
import { Icon } from './Icon';

export const Burger = (props: React.ComponentProps<typeof Icon>) => (
    <Icon {...props}>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
    </Icon>
);
