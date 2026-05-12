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

type Responsiveify<T> = {
    [K in keyof T]?: Responsive<T[K]>;
};

export type Props = {} & DerivedProps;

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

    // console.log(useWindowWidth());
    // console.log(windowWidth);
    // console.log(bp);

    const restProps = rest;

    // const restEntries = Object.entries(rest);
    const restEntries = typedEntries(rest);

    // console.log(restEntries);

    const classes: string[] = [];
    const locked = new Set<string>();
    const propsToPassNext: Partial<Record<keyof BoxProps, unknown>> = {};

    const passNext = (key: string, val: unknown) => {
        propsToPassNext[key as keyof BoxProps] = val;
    };

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
            config.map != null ? config.map[resolved as string | number] : resolved;

        const finalValue = finalResolved as PropValue;

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
                typeof finalValue === 'string' ? finalValue.replace(/\//g, '-') : finalValue;
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
