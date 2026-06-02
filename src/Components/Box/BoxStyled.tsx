import React, { CSSProperties, forwardRef } from 'react';
import { styleProps, type StyleProp as StylePropKey } from './core/styleProps';
import { createPolymorphic } from '../../types/polymorphic';
import { typedEntries } from '../../utils/ts';

const stylePropSet = new Set(styleProps);
const isStyleProp = (key: string): key is StylePropKey => stylePropSet.has(key as StylePropKey);

export type StyleProps = {
    [K in StylePropKey]?: React.CSSProperties[K];
};

type StyleBoxProps = StyleProps;

type ImplProps = {
    as?: React.ElementType;
    children?: React.ReactNode;
    className?: string;
    style?: CSSProperties;
} & Record<string, unknown>;

const StyleBoxImpl = (
    { as, children, className, style: userStyle, ...rest }: ImplProps,
    ref: React.Ref<any>,
) => {
    const Component = as ?? 'div';

    // const style: CSSProperties = { ...userStyle };
    const style: CSSProperties = userStyle ? { ...userStyle } : {};
    const props: Record<string, unknown> = {};

    for (const [key, value] of typedEntries(rest)) {
        if (isStyleProp(key)) {
            if (value != null) (style as any)[key] = value;
        } else {
            props[key] = value;
        }
    }

    return (
        <Component ref={ref} className={className} style={style} {...props}>
            {children}
        </Component>
    );
};

export const BoxStyled = createPolymorphic<StyleBoxProps, 'div'>(
    forwardRef(StyleBoxImpl),
    'BoxStyled',
);
