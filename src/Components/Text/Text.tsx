import React, { forwardRef, HTMLAttributes } from 'react';
import { Box, type BoxProps } from '../Box';
import clsx from 'clsx';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { classPrefix } from '../../utils/classPrefix';

const prefix = (name: string = '') => {
    return classPrefix(`--text${name}`);
};

//---------------------------------------------------------------
// Types
//---------------------------------------------------------------

const textVariants = [
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

type TextVariant = (typeof textVariants)[number] | (string & {});

const textIntents = [
    'default',
    'secondary',
    'primary',
    'warning',
    'danger',
    'success',
    'info',
] as const;

type TextIntent = (typeof textIntents)[number] | (string & {});

const textEmphases = ['subtle', 'muted', 'base', 'strong'] as const;

type TextEmphasis = (typeof textEmphases)[number] | (string & {});

type OwnTextProps = {
    intent?: TextIntent;
    className?: string;
    inline?: boolean;
    variant?: TextVariant;
    emphasis?: TextEmphasis;
    mono?: boolean;
    code?: boolean;
    numeric?: boolean;
};

type TextProps = OwnTextProps & BoxProps;

type ImplTextProps = PolymorphicProps<'p', OwnTextProps>;

const TextImpl = (
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
    }: ImplTextProps,
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

const Text = createPolymorphic<TextProps, 'p'>(forwardRef(TextImpl), 'Text');

export { Text };

export type { TextVariant, TextIntent, TextEmphasis, OwnTextProps, TextProps };

export { textVariants, textIntents, textEmphases };
