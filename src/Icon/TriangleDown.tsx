import React from 'react';
import { Icon } from './Icon';

type Props = React.SVGProps<SVGSVGElement>;

export const TriangleDown = (props: React.ComponentProps<typeof Icon>) => {
    return (
        <Icon fill="currentColor" stroke="none" {...props}>
            <path d="M4 8h16l-8 10z" />
        </Icon>
    );
};
