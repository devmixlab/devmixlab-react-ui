import React from 'react';
import clsx from 'clsx';
import { prefix } from './icon.helpers';

export type IconProps = React.SVGProps<SVGSVGElement> & {
    withoutDefaultStrokeWidth?: boolean;
};

const Icon = ({
    className,
    children,
    strokeWidth,
    withoutDefaultStrokeWidth = false,
    ...props
}: React.PropsWithChildren<IconProps>) => {
    const finalStrokeWidth = withoutDefaultStrokeWidth ? strokeWidth : (strokeWidth ?? 2);

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={finalStrokeWidth}
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
