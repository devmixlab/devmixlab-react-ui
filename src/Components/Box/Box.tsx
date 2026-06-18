import React, { CSSProperties, forwardRef, HTMLAttributes } from 'react';
import { BoxDerivedProps, BoxDerived } from './BoxDerived';
import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';
import { hasKey } from '../../utils/ts';
import { configLookup, type PropValue } from './core/config';
import { createPolymorphic, PolymorphicProps } from '../../types/polymorphic';

import { resolveResponsive, useBreakpoint, Responsiveify } from '../../utils/responsive';

export type Props = {
    grow?: boolean | BoxDerivedProps['grow'];
    shrink?: boolean | BoxDerivedProps['shrink'];
    lineClamp?: number;
    truncate?: boolean;
    isolate?: boolean;
    scrollSmooth?: boolean;
    resizeNone?: boolean;
    appearanceNone?: boolean;
} & Omit<BoxDerivedProps, 'grow' | 'shrink'>;

type BoxProps = Responsiveify<Props>;

type BoxComponentProps<C extends React.ElementType = 'div', Props = {}> = PolymorphicProps<
    C,
    Props & BoxProps
>;

type ImplProps = BoxProps &
    HTMLAttributes<HTMLDivElement> & {
        as?: React.ElementType;
    };

const normalizeCssVar = (name: string): `--${string}` =>
    (name.startsWith('--') ? name : `--${name}`) as `--${string}`;

const BoxImpl = ({ as, className, style, ...rest }: ImplProps, ref: React.Ref<any>) => {
    const asResolved: React.ElementType = as ?? 'div';

    const { breakpoint } = useBreakpoint();

    if (rest?.truncate && rest?.lineClamp != null) {
        console.warn('Box: `truncate` and `lineClamp` are mutually exclusive.');
    }

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

    const restEntries = Object.entries(restProps);

    const classes: string[] = [];
    const cssVars: Record<`--${string}`, string> = {};
    const locked = new Set<string>();
    const propsToPassNext: Partial<Record<keyof BoxProps, unknown>> = {};

    const passNext = (key: string, val: unknown) => {
        propsToPassNext[key as keyof BoxProps] = val;
    };

    restEntries.forEach(([rawKey, value]) => {
        const key = rawKey;
        if (locked.has(key)) return;

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
            if (config.setCssVars) {
                for (const [name, template] of config.setCssVars) {
                    cssVars[normalizeCssVar(name)] = template.replace(
                        '{token}',
                        String(finalValue),
                    );
                }
            }
            if (config.useJustPrefix) {
                classes.push(classPrefix(`--${config.prefix}`));
            } else {
                const safeValue =
                    typeof finalValue === 'string'
                        ? finalValue.replace(/^-/, 'neg-').replace(/\//g, '-')
                        : finalValue;
                classes.push(classPrefix(`--${config.prefix}-${safeValue}`));
            }
        } else {
            passNext(key, finalValue);
        }
    });

    // const mergedStyle =
    //     Object.keys(cssVars).length > 0
    //         ? {
    //               ...style,
    //               ...cssVars,
    //           }
    //         : style;

    const mergedStyle: CSSProperties | undefined =
        Object.keys(cssVars).length > 0
            ? {
                  ...(style as CSSProperties),
                  ...cssVars,
              }
            : (style as CSSProperties | undefined);

    return (
        <BoxDerived
            as={asResolved}
            ref={ref}
            {...(propsToPassNext as BoxDerivedProps)}
            className={clsx(classes, className)}
            style={mergedStyle}
        />
    );
};

export const Box = createPolymorphic<BoxProps, 'div'>(forwardRef(BoxImpl), 'Box');

export type { BoxProps, BoxComponentProps };
