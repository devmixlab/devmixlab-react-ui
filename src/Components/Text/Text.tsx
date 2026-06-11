import React, { CSSProperties, forwardRef } from 'react';
import { Box, type BoxProps } from '../Box';
import clsx from 'clsx';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { classPrefix } from '../../utils/classPrefix';

const prefix = (name: string = '') => {
    return classPrefix(`--text${name}`);
};

type Variant =
    | 'display-lg'
    | 'display-md'
    | 'heading-lg'
    | 'heading-md'
    | 'body-lg'
    | 'body-md'
    | 'body-sm'
    | 'caption'
    | 'micro'
    | (string & {});

type Intent =
    | 'default'
    | 'secondary'
    | 'primary'
    | 'warning'
    | 'danger'
    | 'success'
    | 'info'
    | (string & {});

type Emphasis = 'subtle' | 'muted' | 'base' | 'strong' | (string & {});

export type BaseProps = {
    intent?: Intent;
    className?: string;
    inline?: boolean;
    variant?: Variant;
    emphasis?: Emphasis;
    mono?: boolean;
} & BoxProps;

export type OwnTextProps = BaseProps;

type ImplTextProps<C extends React.ElementType = 'p'> = PolymorphicProps<C, OwnTextProps>;

const TextImpl = <C extends React.ElementType = 'p'>(
    {
        as,
        emphasis = 'base',
        intent = 'default',
        className,
        inline,
        variant = 'body-md',
        mono = false,
        ...rest
    }: ImplTextProps<C>,
    ref: React.Ref<any>,
) => {
    const Component: React.ElementType = as ?? (inline ? 'span' : 'p');

    return (
        <Box
            ref={ref}
            as={Component}
            className={clsx(prefix(), className)}
            {...rest}
            data-variant={variant}
            data-emphasis={emphasis}
            data-intent={intent}
            data-mono={mono || undefined}
        />
    );
};

export const Text = createPolymorphic<OwnTextProps, 'p'>(forwardRef(TextImpl), 'Text');
