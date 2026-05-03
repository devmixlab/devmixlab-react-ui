import React from 'react';
import { Icon } from './Icon';

export const Check = ({
    strokeWidth,
    withoutDefaultStrokeWidth = false,
    ...props
}: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon
            fill="none"
            stroke="currentColor"
            withoutDefaultStrokeWidth={withoutDefaultStrokeWidth}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="20 6 9 17 4 12" />
        </Icon>
    );
};
