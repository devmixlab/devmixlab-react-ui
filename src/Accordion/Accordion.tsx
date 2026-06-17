import React, { forwardRef, useEffect, useMemo, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { Box, BoxComponentProps } from '../Components/Box/Box';
import { Collapse, CollapseProps } from '../Components/Collapse/Collapse';
import { classPrefix } from '../utils/classPrefix';
import {
    AccordionContextValue,
    AccordionContext,
    useAccordionContext,
    AccordionItemContextValue,
    AccordionItemContext,
    useAccordionItemContext,
} from './Accordion.context';
import { useStableId } from '../utils/useStableId';
import { ChevronDown as ChevronDownIcon } from '../Components/Icon';
import { useFocusableList, FocusableItem } from '../hooks/useFocusableList';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const prefix = (name = '') => classPrefix(`--accordion${name}`);

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type AccordionCollapseProps = Pick<
    CollapseProps,
    'enterDuration' | 'exitDuration' | 'easing' | 'keepMounted'
>;

export type AccordionProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        multiple?: boolean;
        collapsible?: boolean;
        defaultValue?: string[];
        value?: string[];
        onValueChange?: (value: string[]) => void;
    } & AccordionCollapseProps
>;

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(
    (
        {
            multiple = false,
            collapsible = true,
            defaultValue = [],
            value: valueProp,
            onValueChange,
            children,
            className,
            rounded = 'md',
            shadow = 'none',
            ...rest
        },
        ref,
    ) => {
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

        const context = useMemo(
            () => ({
                value,
                toggle,
                multiple,
                collapsible,
                id: stableId,
                focusable,
                registerFocusable,
                unregisterFocusable,
            }),
            [
                value,
                multiple,
                collapsible,
                stableId,
                focusable,
                registerFocusable,
                unregisterFocusable,
            ],
        );

        return (
            <AccordionContext.Provider value={context}>
                <Box
                    ref={ref}
                    className={clsx(prefix(), className)}
                    rounded={rounded}
                    shadow={shadow}
                    {...rest}
                >
                    {children}
                </Box>
            </AccordionContext.Provider>
        );
    },
);

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

export type AccordionItemProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        value: string;
        disabled?: boolean;
    }
>;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ value, id, disabled = false, children, className, ...rest }, ref) => {
        const context = useAccordionContext();

        const finalId = id ?? value;

        const triggerId = `${context.id}-${finalId}-trigger`;
        const contentId = `${context.id}-${finalId}-content`;

        const open = context.value.includes(value);

        return (
            <AccordionItemContext.Provider
                value={{
                    value,
                    open,
                    disabled,
                    triggerId,
                    contentId,
                }}
            >
                <Box
                    ref={ref}
                    className={clsx(prefix('__item'), className)}
                    data-state={open ? 'open' : 'closed'}
                    data-disabled={disabled ? '' : undefined}
                    {...rest}
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

export type AccordionTriggerProps<C extends React.ElementType = 'button'> = BoxComponentProps<C>;

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    ({ children, className, onClick, onKeyDown, onFocus, ...rest }, ref) => {
        const accordion = useAccordionContext();
        const item = useAccordionItemContext();

        const notClosable = !accordion.collapsible && item.open && accordion.value.length === 1;

        useEffect(() => {
            accordion.registerFocusable({
                id: item.value,
                disabled: item.disabled,
            });

            return () => {
                accordion.unregisterFocusable(item.value);
            };
        }, [accordion.registerFocusable, accordion.unregisterFocusable, item.value, item.disabled]);

        return (
            <Box
                as="button"
                type="button"
                tabIndex={item.disabled ? -1 : 0}
                // ref={ref}
                ref={(node) => {
                    accordion.focusable.setRef(item.value)(node);

                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
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

                    accordion.toggle(item.value);
                }}
                onFocus={(e) => {
                    onFocus?.(e);
                    accordion.focusable.setFocusedId(item.value);
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
                            accordion.focusable.focusNext(1);
                            break;

                        case 'ArrowUp':
                        case 'PageUp':
                            event.preventDefault();
                            accordion.focusable.focusNext(-1);
                            break;

                        case 'Home':
                            event.preventDefault();
                            accordion.focusable.focusFirst();
                            break;

                        case 'End':
                            event.preventDefault();
                            accordion.focusable.focusLast();
                            break;
                    }
                }}
                {...rest}
            >
                {children}
                <ChevronDownIcon
                    className={prefix('__chevron')}
                    data-state={item.open ? 'open' : 'closed'}
                    aria-hidden
                />
            </Box>
        );
    },
);

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

export type AccordionContentProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    AccordionCollapseProps
>;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
    ({ children, className, enterDuration = 200, exitDuration = 200, ...rest }, ref) => {
        const item = useAccordionItemContext();

        return (
            <Collapse open={item.open} enterDuration={enterDuration} exitDuration={exitDuration}>
                <Box
                    ref={ref}
                    id={item.contentId}
                    role="region"
                    aria-labelledby={item.triggerId}
                    className={clsx(prefix('__content'), className)}
                    data-state={item.open ? 'open' : 'closed'}
                    {...rest}
                >
                    {children}
                </Box>
            </Collapse>
        );
    },
);

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

const Accordion = Object.assign(AccordionRoot, {
    Item: AccordionItem,
    Trigger: AccordionTrigger,
    Content: AccordionContent,
});

export { Accordion };
