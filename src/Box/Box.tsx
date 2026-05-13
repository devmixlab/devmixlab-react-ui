import React, { forwardRef } from 'react';
import { DerivedProps, DerivedBox } from './core/DerivedBox';
import clsx from 'clsx';
import { getActiveBreakpoint, type Responsive, resolveResponsive } from './core/helpers';
import { classPrefix } from '../utils/classPrefix';
import { hasKey, typedEntries } from '../utils/ts';
import { useWindowWidthContext } from './WindowWidthProvider';
import { useWindowWidth } from '../hooks/useWindowWidth';
import { configLookup, type PropValue } from './core/config';
import { createPolymorphic } from '../types/polymorphic';
import { booleanClassMap } from './core/tokens';

type Responsiveify<T> = {
    [K in keyof T]?: Responsive<T[K]>;
};

export type Props = {
    appearanceNone?: boolean;
} & DerivedProps;

export type BoxProps = Responsiveify<Props>;

type ImplProps = {
    children?: React.ReactNode;
    className?: string;
} & Record<string, unknown>;

const BoxImpl = ({ className, ...rest }: ImplProps, ref: React.Ref<any>) => {
    const widthFromContext = useWindowWidthContext();
    const windowWidth =
        widthFromContext && widthFromContext > 0 ? widthFromContext : useWindowWidth();
    const bp = getActiveBreakpoint(windowWidth);

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
        }
    });

    if (rest.grow === 0) classes.push(classPrefix(`--grow-0`));
    if (rest.shrink === 0) classes.push(classPrefix(`--shrink-0`));

    restEntries.forEach(([rawKey, value]) => {
        const key = rawKey as string;
        if (locked.has(key)) return;

        const resolved = resolveResponsive(value, bp);

        if (resolved == null) return;

        if (!hasKey(configLookup, key)) {
            passNext(key, resolved);
            return;
        }

        const config = configLookup[key];

        // console.log(config);
        // console.log(value);
        // console.log(config.isToken(value));

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
        <DerivedBox
            ref={ref}
            {...(propsToPassNext as Props)}
            className={clsx(classes, className)}
        />
    );
};

export const Box = createPolymorphic<BoxProps, 'div'>(forwardRef(BoxImpl), 'Box');
