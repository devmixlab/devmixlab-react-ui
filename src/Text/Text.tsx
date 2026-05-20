import React, { CSSProperties, forwardRef } from 'react';
import { Box, type BoxProps } from '../Box/Box';
import clsx from 'clsx';
import { createPolymorphic } from '../types/polymorphic';
import { classPrefix } from '../utils/classPrefix';

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
    | 'micro';
type Intent = 'default' | 'secondary' | 'primary' | 'warning' | 'danger' | 'success' | 'info';
type Emphasis = 'subtle' | 'muted' | 'base' | 'strong';

export type BaseProps = {
    as?: React.ElementType;
    intent?: Intent;
    className?: string;
    inline?: boolean;
    variant?: Variant;
    emphasis?: Emphasis;
    mono?: boolean;
} & BoxProps;

type TextBehaviorProps =
    | { truncate?: boolean; lineClamp?: never }
    | { lineClamp?: number; truncate?: never };

export type TextProps = TextBehaviorProps & BaseProps;

const TextImpl = (
    {
        as,
        emphasis = 'base',
        intent = 'default',
        truncate = false,
        lineClamp,
        className,
        inline,
        variant = 'body-md',
        mono = false,
        ...rest
    }: TextProps,
    ref: React.Ref<any>,
) => {
    const Component = inline ? (as ?? 'span') : (as ?? 'p');

    const isClamped = typeof lineClamp === 'number' && lineClamp > 0;
    const isTruncated = !isClamped && truncate;

    return (
        <Box
            ref={ref}
            as={Component}
            className={clsx(prefix(), className)}
            {...rest}
            data-variant={variant}
            data-emphasis={emphasis}
            data-intent={intent}
            data-truncate={isTruncated || undefined}
            data-clamp={isClamped || undefined}
            data-mono={mono || undefined}
        />
    );
};

export const Text = createPolymorphic<TextProps, 'p'>(forwardRef(TextImpl), 'Text');
