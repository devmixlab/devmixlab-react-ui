import React, { forwardRef } from 'react';
import { styleAliasMap } from './core/styleAliasMap';
import { BoxStyled, StyleProps } from './BoxStyled';
import { type PolymorphicComponent } from '../types/polymorphic';
import { hasKey, typedEntries } from '../utils/ts';

type AliasMap = typeof styleAliasMap;

export type AliasProps = {
    [K in keyof AliasMap]?: StyleProps[AliasMap[K]];
} & StyleProps;

type AliasBoxProps = AliasProps;

type ImplProps = Record<string, unknown>;

const AliasBoxImpl = (props: ImplProps, ref: React.Ref<any>) => {
    const mapped: Record<string, unknown> = {};

    for (const [key, value] of typedEntries(props)) {
        if (value === undefined) continue;

        const finalKey = hasKey(styleAliasMap, key) ? styleAliasMap[key] : key;

        mapped[finalKey] = value;
    }

    return <BoxStyled ref={ref} {...mapped} />;
};

export const AliasBox = forwardRef(AliasBoxImpl) as PolymorphicComponent<AliasBoxProps, 'div'>;

AliasBox.displayName = 'AliasBox';
