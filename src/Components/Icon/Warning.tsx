import React from 'react';
import { Icon } from './Icon';

type Props = React.SVGProps<SVGSVGElement>;

export const Warning = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon {...props}>
            <path d="M12 3l9 16H3l9-16z" />
            <path d="M12 9.5v3.8" strokeLinecap="round" />
            <circle cx="12" cy="15.8" r="0.9" fill="currentColor" />
        </Icon>
    );
};
