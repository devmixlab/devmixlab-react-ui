import React from 'react';
import clsx from 'clsx';
import { prefix } from './icon.helpers';

export type IconProps = React.SVGProps<SVGSVGElement> & {};

const Icon = ({ className, children, ...props }: React.PropsWithChildren<IconProps>) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={clsx(prefix(), className)}
            {...props}
        >
            {children}
        </svg>
    );
};

export { Icon };
