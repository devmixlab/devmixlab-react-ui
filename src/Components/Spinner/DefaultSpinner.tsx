import React from 'react';
import clsx from 'clsx';
import { prefix as p } from './spinner.helpers';

type SpinnerProps = {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
};

const prefix = (name: string = '') => p(`-default${name}`);

export const DefaultSpinner = ({ className, size = 'md' }: SpinnerProps) => {
    return <span className={clsx(prefix(), prefix(`--${size}`), className)} aria-hidden="true" />;
};
