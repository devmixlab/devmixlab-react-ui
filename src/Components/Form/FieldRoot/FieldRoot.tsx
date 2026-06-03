import React, { forwardRef, useRef, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box';
import type { BoxProps } from '../../Box';
import { Size } from '../form.tokens';
import { mergeRefs } from '../../../utils/mergeRefs';
import { classPrefix } from '../../../utils/classPrefix';

type Variant = 'outlined' | 'filled' | 'ghost';

type ShareFieldRootProps = {
    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;
    controls?: React.ReactNode;

    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;

    // children: React.ReactNode;
    // className?: string;
    //
    // focusTargetRef?: React.RefObject<HTMLElement | null>;
    // onClick?: React.MouseEventHandler<HTMLDivElement>;
};

type OwnFieldRootProps = {
    // start?: React.ReactNode;
    // end?: React.ReactNode;
    // actions?: React.ReactNode;
    // controls?: React.ReactNode;
    //
    // variant?: Variant;
    // size?: Size;
    // disabled?: boolean;
    // readOnly?: boolean;
    // invalid?: boolean;

    children: React.ReactNode;
    className?: string;

    focusTargetRef?: React.RefObject<HTMLElement | null>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
};

type FieldRootProps = React.HTMLAttributes<HTMLDivElement> &
    BoxProps &
    ShareFieldRootProps &
    OwnFieldRootProps;

const renderGroupItem = (content: React.ReactNode) => (
    <span className={classPrefix('--group-item')}>{content}</span>
);

const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(
    (
        {
            start,
            end,
            actions,
            controls,

            variant = 'outlined',
            size = 'md',
            rounded = 'md',
            disabled = false,
            readOnly = false,
            invalid = false,

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
                rootRef.current?.style.setProperty('--fr-start-width', `0px`);
                rootRef.current?.style.setProperty('--fr-end-width', `0px`);
                return;
            }

            const measure = () => {
                const startW = hasStart ? (startRef.current?.offsetWidth ?? 0) : 0;
                const endW = hasEnd ? (endRef.current?.offsetWidth ?? 0) : 0;

                rootRef.current?.style.setProperty('--fr-start-width', `${startW}px`);
                rootRef.current?.style.setProperty('--fr-end-width', `${endW}px`);
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

        const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (disabled) return;

            const isInteractive = (e.target as HTMLElement).closest(
                'button, a, input, textarea, select, [role="button"], [role="switch"], [data-prevent-focus]',
            );

            // only skip focus stealing
            if (!isInteractive) {
                if (focusTargetRef?.current && document.activeElement !== focusTargetRef.current) {
                    focusTargetRef.current.focus();
                }
            }

            // ALWAYS forward click
            onClick?.(e);
        };

        const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
            if (disabled) return;

            if (
                (e.target as HTMLElement).closest(
                    'button, a, input, textarea, select, [role="button"], [role="switch"], [data-prevent-focus]',
                )
            ) {
                return;
            }

            e.preventDefault();

            if (focusTargetRef?.current) {
                focusTargetRef.current.focus();
            }
        };

        return (
            <Box
                ref={combinedRef}
                className={clsx(className, classPrefix(`--field-root`))}
                rounded={rounded}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                data-readonly={readOnly || undefined}
                data-size={size}
                {...(variant ? { ['data-variant']: variant } : {})}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                {...rest}
            >
                {hasStart && (
                    <div
                        ref={startRef}
                        className={clsx(classPrefix(`--slot`), classPrefix(`--slot-start`))}
                    >
                        <span className={classPrefix(`--group`)}>{start}</span>
                    </div>
                )}

                {children}

                {hasEnd && (
                    <div
                        ref={endRef}
                        className={clsx(classPrefix(`--slot`), classPrefix(`--slot-end`))}
                    >
                        {/* 1. VALUE / CONTEXT */}
                        {end && (
                            <span
                                className={clsx(classPrefix(`--group`), classPrefix(`--end-group`))}
                            >
                                {end}
                            </span>
                        )}

                        {/* 2. ACTIONS (clear + custom actions) */}
                        {actions && (
                            <span
                                className={clsx(
                                    classPrefix(`--group`),
                                    classPrefix(`--actions-group`),
                                )}
                            >
                                {actions}
                            </span>
                        )}

                        {/* 3. CONTROLS */}
                        {controls && (
                            <span
                                className={clsx(
                                    classPrefix(`--group`),
                                    classPrefix(`--controls-group`),
                                )}
                            >
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

export { FieldRoot, renderGroupItem };

export type { Variant, FieldRootProps, ShareFieldRootProps, OwnFieldRootProps };
