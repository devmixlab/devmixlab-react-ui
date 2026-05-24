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
        defaultValue?: string[];
        value?: string[];
        onValueChange?: (value: string[]) => void;
    } & AccordionCollapseProps
>;

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(
    (
        {
            multiple = false,
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

        const toggle = (itemValue: string) => {
            let nextValue: string[];

            if (multiple) {
                nextValue = value.includes(itemValue)
                    ? value.filter((v) => v !== itemValue)
                    : [...value, itemValue];
            } else {
                nextValue = value.includes(itemValue) ? [] : [itemValue];
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
                id: stableId,
            }),
            [value, multiple, stableId],
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
    }
>;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ value, children, className, ...rest }, ref) => {
        const context = useAccordionContext();

        const triggerId = context.id + '-item-trigger';
        const contentId = context.id + '-item-content';

        const open = context.value.includes(value);

        return (
            <AccordionItemContext.Provider
                value={{
                    value,
                    open,
                    triggerId,
                    contentId,
                }}
            >
                <Box
                    ref={ref}
                    className={clsx(prefix('__item'), className)}
                    data-state={open ? 'open' : 'closed'}
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

        return (
            <Box
                as="button"
                type="button"
                ref={ref}
                id={item.triggerId}
                className={clsx(prefix('__trigger'), className)}
                aria-expanded={item.open}
                aria-controls={item.contentId}
                data-state={item.open ? 'open' : 'closed'}
                onClick={(event) => {
                    onClick?.(event);

                    if (event.defaultPrevented) {
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
