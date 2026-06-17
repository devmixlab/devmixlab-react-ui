import React, { forwardRef, HTMLAttributes } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { Box, type BoxProps } from '../Box';
import clsx from 'clsx';
import { createPolymorphic } from '../../types/polymorphic';

//------------------------------------------------------------
// Types
//------------------------------------------------------------

const headingTagLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingTagLevel = (typeof headingTagLevels)[number];

const headingNumericLevels = [1, 2, 3, 4, 5, 6] as const;
type HeadingNumericLevel = (typeof headingNumericLevels)[number];

type HeadingLevel = HeadingTagLevel | HeadingNumericLevel;

type OwnHeadingProps = {
    level?: HeadingLevel;
};

type HeadingProps = OwnHeadingProps & BoxProps;

type SemanticHeadingProps = Omit<HeadingProps, 'level'>;

type ImplSemanticHeadingProps = SemanticHeadingProps &
    HTMLAttributes<HTMLHeadingElement> & {
        as?: React.ElementType;
    };

type ImplHeadingProps = HeadingProps &
    HTMLAttributes<HTMLHeadingElement> & {
        as?: React.ElementType;
    };

//------------------------------------------------------------
// Helpers
//------------------------------------------------------------

const prefix = (name: string = '') => {
    return classPrefix(`--heading${name}`);
};

function createHeadingAlias<TLevel extends HeadingTagLevel>(level: TLevel, name: string) {
    return createPolymorphic<SemanticHeadingProps, TLevel>(
        forwardRef((props: ImplSemanticHeadingProps, ref: React.Ref<HTMLHeadingElement>) => (
            <Heading {...props} ref={ref} level={level} />
        )),
        name,
    );
}

//------------------------------------------------------------
// Heading component
//------------------------------------------------------------

const HeadingImpl = (
    { className, as, level = 'h4', ...rest }: ImplHeadingProps,
    ref: React.Ref<HTMLHeadingElement>,
) => {
    const normalizedLevel: HeadingTagLevel =
        typeof level === 'number' ? (`h${level}` as HeadingTagLevel) : level;
    const Component = as ?? normalizedLevel;

    return (
        <Box
            {...rest}
            ref={ref}
            as={Component}
            className={clsx(prefix(), className)}
            data-level={normalizedLevel}
        />
    );
};

const Heading = createPolymorphic<HeadingProps, 'h4'>(forwardRef(HeadingImpl), 'Heading');

//------------------------------------------------------------
// Heading semantic components - H1
//------------------------------------------------------------

const H1 = createHeadingAlias('h1', 'H1');
const H2 = createHeadingAlias('h2', 'H2');
const H3 = createHeadingAlias('h3', 'H3');
const H4 = createHeadingAlias('h4', 'H4');
const H5 = createHeadingAlias('h5', 'H5');
const H6 = createHeadingAlias('h6', 'H6');

//------------------------------------------------------------
// Exports
//------------------------------------------------------------

export { Heading, H1, H2, H3, H4, H5, H6 };

export type {
    HeadingTagLevel,
    HeadingNumericLevel,
    HeadingLevel,
    HeadingProps,
    OwnHeadingProps,
    SemanticHeadingProps,
};

export { headingTagLevels, headingNumericLevels };
