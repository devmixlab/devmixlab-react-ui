import React, {
    forwardRef,
    useEffect,
    useMemo,
    useState,
    useCallback,
    CSSProperties,
    HTMLAttributes,
} from 'react';
import { clsx } from 'clsx';
import { Box, DerivedProps, BoxDerived } from '../Box';
import { Collapse, CollapseProps } from '../Collapse';
import { classPrefix } from '../../utils/classPrefix';
import { AccordionContextValue, AccordionContext, useAccordionContext } from './Accordion.context';
import {
    AccordionItemContextValue,
    AccordionItemContext,
    useAccordionItemContext,
} from './AccordionItem.context';
import {
    AccordionCollapseContextValue,
    AccordionCollapseContext,
    useAccordionCollapseContext,
} from './AccordionCollapse.context';
import { useStableId } from '../../utils/useStableId';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import { useFocusableList, FocusableItem } from '../../hooks/useFocusableList';
import { resolveResponsive, Responsive, useBreakpoint } from '../../utils/responsive';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--accordion${name}`);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const accordionDensities = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
type AccordionDensity = (typeof accordionDensities)[number];

type OwnAccordionProps = {
    chevronDuration?: number;
    chevronEasing?: string;
    multiple?: boolean;
    collapsible?: boolean;
    defaultValue?: string[];
    value?: string[];
    onValueChange?: (value: string[]) => void;
    variant?: string;
    density?: Responsive<AccordionDensity>;
};

export type AccordionProps = OwnAccordionProps &
    DerivedProps &
    Partial<AccordionCollapseContextValue> &
    HTMLAttributes<HTMLDivElement>;

// -----------------------------------------------------------------------------
// Root component
// -----------------------------------------------------------------------------

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(
    (
        {
            children,
            className,

            multiple = false,
            collapsible = true,
            defaultValue = [],
            value: valueProp,
            onValueChange,
            variant,
            density: densityProp,

            enterDuration = 200,
            exitDuration = 150,
            enterEasing = 'cubic-bezier(0.25, 1, 0.5, 1)',
            exitEasing = 'cubic-bezier(0.4, 0, 1, 1)',
            keepMounted,
            reduceMotion,

            triggerDuration = 150,
            triggerEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',

            rounded = 'md',
            shadow = 'none',

            ...rest
        },
        ref,
    ) => {
        const { breakpoint } = useBreakpoint();

        const density = resolveResponsive(densityProp, breakpoint) ?? 'xs';

        const stableId = useStableId('accordion');

        const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

        const [focusableItems, setFocusableItems] = useState<FocusableItem[]>([]);

        const registerFocusable = useCallback((item: FocusableItem) => {
            setFocusableItems((prev) => {
                const exists = prev.some((i) => i.id === item.id);

                if (exists) {
                    return prev.map((i) => (i.id === item.id ? item : i));
                }

                return [...prev, item];
            });
        }, []);

        const unregisterFocusable = useCallback((id: string) => {
            setFocusableItems((prev) => prev.filter((item) => item.id !== id));
        }, []);

        const focusable = useFocusableList(focusableItems);

        const value = valueProp ?? uncontrolledValue;

        if (!multiple && !collapsible && !valueProp && defaultValue.length === 0) {
            console.warn(
                '[Accordion] `collapsible={false}` requires a `defaultValue` in uncontrolled mode.',
            );
        }

        const toggle = (itemValue: string) => {
            let nextValue: string[];

            if (multiple) {
                const isOpen = value.includes(itemValue);

                if (isOpen) {
                    nextValue =
                        !collapsible && value.length === 1
                            ? value
                            : value.filter((v) => v !== itemValue);
                } else {
                    nextValue = [...value, itemValue];
                }
            } else {
                const isOpen = value.includes(itemValue);

                if (isOpen) {
                    nextValue = collapsible ? [] : value;
                } else {
                    nextValue = [itemValue];
                }
            }

            if (!valueProp) {
                setUncontrolledValue(nextValue);
            }

            onValueChange?.(nextValue);
        };

        const context: AccordionContextValue = useMemo(
            () => ({
                value,
                toggle,
                multiple,
                collapsible,
                id: stableId,
                focusable,
                registerFocusable,
                unregisterFocusable,
                variant,
                density,
            }),
            [
                value,
                multiple,
                collapsible,
                stableId,
                focusable,
                registerFocusable,
                unregisterFocusable,
                variant,
                density,
            ],
        );

        const collapseContext: AccordionCollapseContextValue = useMemo(
            () => ({
                enterDuration,
                exitDuration,
                enterEasing,
                exitEasing,
                keepMounted,
                reduceMotion,
                triggerDuration,
                triggerEasing,
            }),
            [
                enterDuration,
                exitDuration,
                enterEasing,
                exitEasing,
                keepMounted,
                reduceMotion,
                triggerDuration,
                triggerEasing,
            ],
        );

        return (
            <AccordionContext.Provider value={context}>
                <AccordionCollapseContext.Provider value={collapseContext}>
                    <Box
                        {...rest}
                        ref={ref}
                        className={clsx(prefix(), className)}
                        rounded={rounded}
                        shadow={shadow}
                        data-variant={variant}
                        data-density={density}
                    >
                        {children}
                    </Box>
                </AccordionCollapseContext.Provider>
            </AccordionContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

type OwnAccordionItemProps = {
    value: string;
    disabled?: boolean;
};

export type AccordionItemProps = OwnAccordionItemProps &
    DerivedProps &
    HTMLAttributes<HTMLDivElement>;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ children, className, value, id, disabled = false, ...rest }, ref) => {
        const context = useAccordionContext();

        const finalId = id ?? value;

        const triggerId = `${context.id}-${finalId}-trigger`;
        const contentId = `${context.id}-${finalId}-content`;

        const open = context.value.includes(value);

        const itemContext: AccordionItemContextValue = useMemo(
            () => ({
                value,
                open,
                disabled,
                triggerId,
                contentId,
            }),
            [value, open, disabled, triggerId, contentId],
        );

        return (
            <AccordionItemContext.Provider value={itemContext}>
                <Box
                    {...rest}
                    ref={ref}
                    className={clsx(prefix('__item'), className)}
                    data-state={open ? 'open' : 'closed'}
                    data-disabled={disabled ? '' : undefined}
                >
                    {children}
                </Box>
            </AccordionItemContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

export type AccordionTriggerProps = {
    animationDuration?: number;
    animationEasing?: string;
} & DerivedProps &
    HTMLAttributes<HTMLButtonElement>;

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    (
        {
            children,
            className,
            style,

            onClick,
            onKeyDown,
            onFocus,

            animationDuration: animationDurationProp,
            animationEasing: animationEasingProp,

            ...rest
        },
        ref,
    ) => {
        const ctxCollapse = useAccordionCollapseContext();
        const ctxAccordion = useAccordionContext();
        const item = useAccordionItemContext();

        const animationDuration = ctxCollapse?.reduceMotion
            ? 0
            : (animationDurationProp ?? ctxCollapse?.triggerDuration);
        const animationEasing = animationEasingProp ?? ctxCollapse?.triggerEasing;

        const notClosable =
            !ctxAccordion.collapsible && item.open && ctxAccordion.value.length === 1;

        useEffect(() => {
            ctxAccordion.registerFocusable({
                id: item.value,
                disabled: item.disabled,
            });

            return () => {
                ctxAccordion.unregisterFocusable(item.value);
            };
        }, [
            ctxAccordion.registerFocusable,
            ctxAccordion.unregisterFocusable,
            item.value,
            item.disabled,
        ]);

        return (
            <BoxDerived
                {...rest}
                as="button"
                type="button"
                tabIndex={item.disabled ? -1 : 0}
                // ref={ref}
                ref={(node) => {
                    ctxAccordion.focusable.setRef(item.value)(node);

                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                style={
                    {
                        ...style,

                        '--accordion-trigger-duration': `${animationDuration}ms`,
                        '--accordion-trigger-easing': animationEasing,
                    } as CSSProperties
                }
                id={item.triggerId}
                className={clsx(prefix('__trigger'), className)}
                aria-expanded={item.open}
                aria-controls={item.contentId}
                aria-disabled={item.disabled || notClosable}
                data-state={item.open ? 'open' : 'closed'}
                data-disabled={item.disabled ? '' : undefined}
                data-not-closable={notClosable ? '' : undefined}
                onClick={(event) => {
                    onClick?.(event);

                    if (event.defaultPrevented || item.disabled || notClosable) {
                        return;
                    }

                    ctxAccordion.toggle(item.value);
                }}
                onFocus={(e) => {
                    onFocus?.(e);
                    ctxAccordion.focusable.setFocusedId(item.value);
                }}
                onKeyDown={(event) => {
                    onKeyDown?.(event);

                    if (event.defaultPrevented) {
                        return;
                    }

                    switch (event.key) {
                        case 'ArrowDown':
                        case 'PageDown':
                            event.preventDefault();
                            ctxAccordion.focusable.focusNext(1);
                            break;

                        case 'ArrowUp':
                        case 'PageUp':
                            event.preventDefault();
                            ctxAccordion.focusable.focusNext(-1);
                            break;

                        case 'Home':
                            event.preventDefault();
                            ctxAccordion.focusable.focusFirst();
                            break;

                        case 'End':
                            event.preventDefault();
                            ctxAccordion.focusable.focusLast();
                            break;
                    }
                }}
            >
                {children}
                <ChevronDownIcon
                    className={prefix('__chevron')}
                    data-state={item.open ? 'open' : 'closed'}
                    aria-hidden
                />
            </BoxDerived>
        );
    },
);

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

export type AccordionContentProps = Omit<CollapseProps, 'open'> &
    DerivedProps &
    HTMLAttributes<HTMLDivElement>;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
    (
        {
            children,
            className,

            enterDuration: enterDurationProp,
            exitDuration: exitDurationProp,
            enterEasing: enterEasingProp,
            exitEasing: exitEasingProp,
            keepMounted: keepMountedProp,
            reduceMotion: reduceMotionProp,

            onMount,
            onUnmount,
            onEntered,
            onExited,

            ...rest
        },
        ref,
    ) => {
        const ctxItem = useAccordionItemContext();
        const ctxCollapse = useAccordionCollapseContext();

        const collapseProps = {
            enterDuration: enterDurationProp ?? ctxCollapse?.enterDuration,
            exitDuration: exitDurationProp ?? ctxCollapse?.exitDuration,
            enterEasing: enterEasingProp ?? ctxCollapse?.enterEasing,
            exitEasing: exitEasingProp ?? ctxCollapse?.exitEasing,
            keepMounted: keepMountedProp ?? ctxCollapse?.keepMounted,
            reduceMotion: reduceMotionProp ?? ctxCollapse?.reduceMotion,
            onMount,
            onUnmount,
            onEntered,
            onExited,
        };

        return (
            <Collapse open={ctxItem.open} {...collapseProps}>
                <BoxDerived
                    {...rest}
                    ref={ref}
                    id={ctxItem.contentId}
                    role="region"
                    aria-labelledby={ctxItem.triggerId}
                    className={clsx(prefix('__content'), className)}
                    data-state={ctxItem.open ? 'open' : 'closed'}
                >
                    {children}
                </BoxDerived>
            </Collapse>
        );
    },
);

const Accordion = Object.assign(AccordionRoot, {
    Item: AccordionItem,
    Trigger: AccordionTrigger,
    Content: AccordionContent,
});

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export { Accordion };

export type { AccordionDensity };
