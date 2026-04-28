import React from 'react';
import clsx from 'clsx';
import { prefix } from './icon.helpers';

export type IconWrapperProps = React.HTMLAttributes<HTMLSpanElement> & {
    children: React.ReactNode;
};

const IconWrapper = ({ className, children, ...props }: IconWrapperProps) => {
    return (
        <span className={clsx(prefix(), className)} aria-hidden="true" {...props}>
            {children}
        </span>
    );
};

IconWrapper.displayName = 'IconWrapper';

export { IconWrapper };
