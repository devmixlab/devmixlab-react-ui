import React, { forwardRef, useId, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { Box, BoxComponentProps } from '../Box/Box';
import { Collapse, CollapseProps } from '../Collapse/Collapse';
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
import { ChevronDown as ChevronDownIcon } from '../Icon';

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
        const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
        const stableId = useStableId('accordion');

        const value = valueProp ?? uncontrolledValue;

        if (!multiple && !collapsible && !valueProp && defaultValue.length === 0) {
            console.warn(
                '[Accordion] `collapsible={false}` requires a `defaultValue` in uncontrolled mode.',
            );
        }

        const toggle = (itemValue: string) => {
            let nextValue: string[];

            if (multiple) {
                nextValue = value.includes(itemValue)
                    ? value.filter((v) => v !== itemValue)
                    : [...value, itemValue];
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
            }),
            [value, multiple, stableId, collapsible],
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
    ({ value, disabled = false, children, className, ...rest }, ref) => {
        const context = useAccordionContext();

        const triggerId = context.id + '-item-trigger';
        const contentId = context.id + '-item-content';

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
    ({ children, className, onClick, ...rest }, ref) => {
        const accordion = useAccordionContext();
        const item = useAccordionItemContext();

        const isNotClosable =
            !accordion.multiple &&
            !accordion.collapsible &&
            item.open &&
            accordion.value.length === 1;

        return (
            <Box
                as="button"
                type="button"
                tabIndex={item.disabled ? -1 : 0}
                ref={ref}
                id={item.triggerId}
                className={clsx(prefix('__trigger'), className)}
                aria-expanded={item.open}
                aria-controls={item.contentId}
                aria-disabled={item.disabled}
                data-state={item.open ? 'open' : 'closed'}
                data-disabled={item.disabled ? '' : undefined}
                data-not-active={isNotClosable ? '' : undefined}
                onClick={(event) => {
                    onClick?.(event);

                    if (event.defaultPrevented || item.disabled) {
                        return;
                    }

                    accordion.toggle(item.value);
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
