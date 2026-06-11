import React, { forwardRef } from 'react';
import { Box, type BoxProps } from '../Box';
import clsx from 'clsx';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { classPrefix } from '../../utils/classPrefix';

const prefix = (name: string = '') => {
    return classPrefix(`--text${name}`);
};

export const textVariants = [
    'display-lg',
    'display-md',
    'heading-lg',
    'heading-md',
    'body-lg',
    'body-md',
    'body-sm',
    'caption',
    'micro',
] as const;

export type TextVariant = (typeof textVariants)[number] | (string & {});

export const textIntents = [
    'default',
    'secondary',
    'primary',
    'warning',
    'danger',
    'success',
    'info',
] as const;

export type TextIntent = (typeof textIntents)[number] | (string & {});

export const textEmphases = ['subtle', 'muted', 'base', 'strong'] as const;

export type TextEmphasis = (typeof textEmphases)[number] | (string & {});

export type BaseProps = {
    intent?: TextIntent;
    className?: string;
    inline?: boolean;
    variant?: TextVariant;
    emphasis?: TextEmphasis;
    mono?: boolean;
    code?: boolean;
    numeric?: boolean;
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
        variant,
        mono = false,
        code = false,
        numeric = false,
        ...rest
    }: ImplTextProps<C>,
    ref: React.Ref<any>,
) => {
    const isMono = mono || code;
    const Component: React.ElementType = as ?? (code ? 'code' : inline ? 'span' : 'p');

    return (
        <Box
            ref={ref}
            as={Component}
            className={clsx(prefix(), className)}
            {...rest}
            data-variant={variant}
            data-emphasis={emphasis}
            data-intent={intent}
            data-mono={isMono || undefined}
            data-code={code || undefined}
            data-numeric={numeric || undefined}
        />
    );
};

export const Text = createPolymorphic<OwnTextProps, 'p'>(forwardRef(TextImpl), 'Text');
