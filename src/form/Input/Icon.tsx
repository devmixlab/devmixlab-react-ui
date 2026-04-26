import React from 'react';
import clsx from 'clsx';

export type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string;
};

const Icon = ({
    className,
    size = '1.2em',
    children,
    ...props
}: React.PropsWithChildren<IconProps>) => {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={clsx('dru--icon', className)}
            {...props}
        >
            {children}
        </svg>
    );
};

export { Icon };
