import React, { forwardRef, useRef, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size, Variant } from '../Input/input.tokens';
// import { prefix } from '../Input/input.helpers';
import { mergeRefs } from '../../utils/mergeRefs';
// import { CLASS_PREFIX } from '../../constants';
import { classPrefix } from '../../utils/classPrefix';

export type FieldRootProps = BoxProps & {
    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;
    controls?: React.ReactNode;

    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];

    children: React.ReactNode;
    className?: string;

    focusTargetRef?: React.RefObject<HTMLElement | null>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export const prefix = (name: string = '') => {
    return classPrefix(`--field-root${name}`);
};

const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(
    (
        {
            start,
            end,
            actions,
            controls,

            variant = 'outlined',
            size = 'md',
            disabled = false,
            invalid = false,
            rounded = 'md',

            children,
            className,

            focusTargetRef,
            onClick,

            ...rest
        },
        ref,
    ) => {
        const startRef = useRef<HTMLDivElement>(null);
        const endRef = useRef<HTMLDivElement>(null);
        const rootRef = useRef<HTMLDivElement>(null);

        const combinedRef = mergeRefs(rootRef, ref);

        const hasStart = !!start;
        const hasEnd = !!(end || actions || controls);

        useLayoutEffect(() => {
            if (!hasStart && !hasEnd) {
                rootRef.current?.style.setProperty('--start-width', `0px`);
                rootRef.current?.style.setProperty('--end-width', `0px`);
                return;
            }

            const measure = () => {
                const startW = hasStart ? (startRef.current?.offsetWidth ?? 0) : 0;
                const endW = hasEnd ? (endRef.current?.offsetWidth ?? 0) : 0;

                rootRef.current?.style.setProperty('--start-width', `${startW}px`);
                rootRef.current?.style.setProperty('--end-width', `${endW}px`);
            };

            measure();

            const ro = new ResizeObserver(measure);

            if (hasStart && startRef.current) {
                ro.observe(startRef.current);
            }

            if (hasEnd && endRef.current) {
                ro.observe(endRef.current);
            }

            return () => ro.disconnect();
        }, [start, end, actions, controls]);

        const cl = clsx(
            className,
            prefix(),
            classPrefix(`--${variant}`),
            // classPrefix(`--size-${size}`),
            {
                [classPrefix(`--invalid`)]: invalid,
                [classPrefix(`--disabled`)]: disabled,
                [classPrefix(`--has-start-slot`)]: hasStart,
                [classPrefix(`--has-end-slot`)]: hasEnd,
            },
        );

        const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (disabled) return;

            // avoid stealing focus from interactive children (buttons, etc.)
            if (
                (e.target as HTMLElement).closest(
                    'button, a, input, textarea, select, [role="button"], [role="switch"]',
                )
            ) {
                return;
            }

            // focusTargetRef?.current?.focus();
            if (focusTargetRef?.current && document.activeElement !== focusTargetRef.current) {
                focusTargetRef.current.focus();
            }
            onClick?.(e);
        };

        const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;

            if (
                (e.target as HTMLElement).closest(
                    'button, a, input, textarea, select, [role="button"], [role="switch"]',
                )
            ) {
                return;
            }

            if (focusTargetRef?.current) {
                focusTargetRef.current.focus();
            }
        };

        return (
            <Box
                ref={combinedRef}
                className={cl}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                {...(variant ? { ['data-variant']: variant } : {})}
                rounded={rounded}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                {...rest}
            >
                {hasStart && (
                    <div ref={startRef} className={clsx(prefix(`__slot`), prefix(`__slot-start`))}>
                        <span className={prefix(`__group`)}>{start}</span>
                    </div>
                )}

                {children}

                {hasEnd && (
                    <div ref={endRef} className={clsx(prefix(`__slot`), prefix(`__slot-end`))}>
                        {/* 1. VALUE / CONTEXT */}
                        {end && (
                            <span className={clsx(prefix(`__group`), prefix(`__end-group`))}>
                                {end}
                            </span>
                        )}

                        {/* 2. ACTIONS (clear + custom actions) */}
                        {actions && (
                            <span className={clsx(prefix(`__group`), prefix(`__actions-group`))}>
                                {actions}
                            </span>
                        )}

                        {/* 3. CONTROLS */}
                        {controls && (
                            <span className={clsx(prefix(`__group`), prefix(`__controls-group`))}>
                                {controls}
                            </span>
                        )}
                    </div>
                )}
            </Box>
        );
    },
);

FieldRoot.displayName = 'FieldRoot';

export { FieldRoot };
