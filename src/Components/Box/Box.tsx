import React, { forwardRef } from 'react';
import { DerivedProps, BoxDerived } from './BoxDerived';
import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';
import { hasKey, typedEntries } from '../../utils/ts';
import { configLookup, type PropValue } from './core/config';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';
import { booleanClassMap } from './core/tokens';

import { resolveResponsive, useBreakpoint, Responsiveify } from '../../utils/responsive';

export type Props = {
    appearanceNone?: boolean;
    grow?: boolean | 0 | DerivedProps['grow'];
} & Omit<DerivedProps, 'grow'>;

type BoxProps = Responsiveify<Props>;

type BoxComponentProps<C extends React.ElementType = 'div', Props = {}> = PolymorphicProps<
    C,
    Props & BoxProps
>;

type ImplProps = {
    children?: React.ReactNode;
    className?: string;
} & Record<string, unknown>;

const BoxImpl = ({ className, ...rest }: ImplProps, ref: React.Ref<any>) => {
    const { breakpoint } = useBreakpoint();

    const booleanKeys = new Set(Object.keys(booleanClassMap));
    const restProps = rest;

    // Transition composition
    const hasTransitionHelpers =
        restProps.transD != null || restProps.transE != null || restProps.transP != null;

    if (hasTransitionHelpers && restProps.transition == null) {
        if (restProps.transD == null) {
            restProps.transD = 'normal';
        }

        if (restProps.transE == null) {
            restProps.transE = 'standard';
        }

        if (restProps.transP == null) {
            restProps.transP = 'all';
        }
    }

    // const restEntries = typedEntries(rest);
    const restEntries = typedEntries(restProps);

    const classes: string[] = [];
    const locked = new Set<string>();
    const propsToPassNext: Partial<Record<keyof BoxProps, unknown>> = {};

    const passNext = (key: string, val: unknown) => {
        propsToPassNext[key as keyof BoxProps] = val;
    };

    Object.entries(booleanClassMap).forEach(([key, className]) => {
        if (rest[key] === true) {
            classes.push(classPrefix(className));
            locked.add(key);
        }
    });

    if (rest.grow === 0) classes.push(classPrefix(`--grow-0`));
    if (rest.shrink === 0) classes.push(classPrefix(`--shrink-0`));

    restEntries.forEach(([rawKey, value]) => {
        const key = rawKey as string;
        if (locked.has(key)) return;

        if (key == 'grow') return;

        // prevent leaking boolean utility props
        // if (booleanKeys.has(key)) return;

        const resolved = resolveResponsive(value, breakpoint);

        if (resolved == null) return;

        if (!hasKey(configLookup, key)) {
            passNext(key, resolved);
            return;
        }

        const config = configLookup[key];

        locked.add(config.key);
        if (config.alias) locked.add(config.alias);

        const finalResolved =
            config.map != null ? (config.map[resolved as string | number] ?? resolved) : resolved;

        const finalValue = config.modifyValue
            ? config.modifyValue(finalResolved as PropValue)
            : (finalResolved as PropValue);

        const configCheck = config.check
            ? config.check({ props: restProps as Props, key, value: finalValue })
            : true;

        if (config.resolveInStyle) {
            if (!configCheck) {
                passNext(key, finalValue);
                return;
            }

            passNext(
                key,
                config.resolveInStyle({
                    value: finalValue,
                }),
            );

            return;
        }

        if (config.isToken && config.isToken(finalValue) && configCheck) {
            const safeValue =
                typeof finalValue === 'string'
                    ? finalValue.replace(/^-/, 'neg-').replace(/\//g, '-')
                    : finalValue;
            classes.push(classPrefix(`--${config.prefix}-${safeValue}`));
        } else {
            passNext(key, finalValue);
        }
    });

    return (
        <BoxDerived
            ref={ref}
            {...(propsToPassNext as DerivedProps)}
            className={clsx(classes, className)}
        />
    );
};

export const Box = createPolymorphic<BoxProps, 'div'>(forwardRef(BoxImpl), 'Box');

export type { BoxProps, BoxComponentProps };
