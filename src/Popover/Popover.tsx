import React, { createContext, forwardRef, useContext, useMemo, useState } from 'react';
import type { Placement } from '@floating-ui/react';
import { Box, BoxProps } from '../Box/Box';
import { mergeRefs } from '../utils/mergeRefs';
import { classPrefix } from '../utils/classPrefix';
import { useStableId } from '../utils/useStableId';
import { useFloatingLayer } from '../hooks';
import { PopoverContext, usePopoverContext, type PopoverContextValue } from './Popover.context';
import { Button, ButtonProps } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverSize = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

type PopoverProps = {
    children: React.ReactNode;

    size?: PopoverSize;

    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    disabled?: boolean;

    placement?: Placement;
};

type triggerRenderProps = {
    disabled: boolean;
    opened: boolean;
    focusedVisible: boolean;
    pressed: boolean;
};

type PopoverTriggerProps = {
    className?: string;
    children: React.ReactElement;
    asChild?: boolean;
    chevron?: boolean;
    render?: (props: triggerRenderProps) => React.ReactNode;
};

type PopoverPanelProps = {
    children: React.ReactNode;
    className?: string;
};

type PopoverComponent = React.ForwardRefExoticComponent<
    PopoverProps & React.RefAttributes<HTMLDivElement>
> & {
    Trigger: typeof PopoverTrigger;
    Panel: typeof PopoverPanel;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const prefix = (name: string = '') => {
    return classPrefix(`--popover${name}`);
};

// ---------------------------------------------------------------------------
// Popover
// ---------------------------------------------------------------------------

const Popover = forwardRef<HTMLDivElement, PopoverProps>(
    (
        {
            children,

            size = 'auto',

            open,
            defaultOpen = false,
            onOpenChange,

            disabled = false,

            placement = 'bottom-start',
        },
        ref,
    ) => {
        const isControlled = open !== undefined;

        const [internalOpen, setInternalOpen] = useState(defaultOpen);

        const opened = isControlled ? open : internalOpen;

        const setOpened = (next: boolean) => {
            if (!isControlled) {
                setInternalOpen(next);
            }

            onOpenChange?.(next);
        };

        const triggerId = useStableId('popover-trigger');
        const panelId = useStableId('popover-panel');

        const { refs, floatingStyles, getReferenceProps, getFloatingProps } = useFloatingLayer(
            opened,
            setOpened,
            placement,
        );

        const value = useMemo<PopoverContextValue>(
            () => ({
                opened,
                setOpened,

                disabled,

                refs,
                floatingStyles,

                getReferenceProps,
                getFloatingProps,

                triggerId,
                panelId,
            }),
            [
                opened,
                disabled,
                refs,
                floatingStyles,
                getReferenceProps,
                getFloatingProps,
                triggerId,
                panelId,
            ],
        );

        return (
            <PopoverContext.Provider value={value}>
                <Box ref={mergeRefs(ref, null)} className={prefix()}>
                    {children}
                </Box>
            </PopoverContext.Provider>
        );
    },
) as PopoverComponent;

Popover.displayName = 'Popover';

const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
    ({ children, className, chevron = false, render, ...rest }, ref) => {
        const {
            opened,
            setOpened,

            disabled,

            refs,
            getReferenceProps,

            triggerId,
            panelId,
        } = usePopoverContext();

        const combinedRef = mergeRefs(refs.setReference, ref);

        // ------------------------------------------------------------------
        // Trigger press state
        // ------------------------------------------------------------------

        const [triggerFocusedVisible, setTriggerFocusedVisible] = useState(false);
        const [pressed, setPressed] = useState(false);

        const handleKeyDown = (e: React.KeyboardEvent) => {
            const key = e.key;

            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                setPressed(true);
                setOpened(!opened);
            }
        };

        return (
            <Box
                ref={combinedRef}
                {...getReferenceProps()}
                className={prefix('__trigger')}
                onClick={() => {
                    if (disabled) return;
                    setOpened(!opened);
                }}
                tabIndex={disabled ? -1 : 0}
                onFocus={(e) => {
                    if (disabled) return;
                    setTriggerFocusedVisible(e.currentTarget.matches(':focus-visible'));
                }}
                onBlur={() => setTriggerFocusedVisible(false)}
                onKeyDown={(e) => {
                    if (disabled) return;
                    handleKeyDown(e);
                }}
                onKeyUp={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') setPressed(false);
                }}
                onMouseDown={() => {
                    if (disabled) return;
                    setPressed(true);
                }}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                aria-expanded={opened}
                aria-controls={opened ? panelId : undefined}
                aria-haspopup="dialog"
            >
                {render ? (
                    render({
                        disabled: disabled ?? false,
                        opened,
                        focusedVisible: triggerFocusedVisible,
                        pressed,
                    })
                ) : (
                    <Button
                        type="button"
                        disabled={disabled}
                        pseudoFocused={triggerFocusedVisible}
                        pseudoActive={pressed}
                        className={className}
                        {...rest}
                        active={opened}
                        endIcon={
                            chevron && (
                                <ChevronDownIcon
                                    className={prefix('__chevron')}
                                    data-opened={opened || undefined}
                                    aria-hidden
                                />
                            )
                        }
                    >
                        {children}
                    </Button>
                )}
            </Box>
        );
    },
);

PopoverTrigger.displayName = 'PopoverTrigger';

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const PopoverPanel = forwardRef<HTMLDivElement, PopoverPanelProps>(
    ({ children, className }, ref) => {
        const {
            opened,
            setOpened,

            refs,
            floatingStyles,
            getFloatingProps,

            triggerId,
            panelId,
        } = usePopoverContext();

        if (!opened) {
            return null;
        }

        return (
            <Box
                ref={mergeRefs(refs.setFloating, ref)}
                id={panelId}
                role="dialog"
                aria-modal={false}
                aria-labelledby={triggerId}
                style={floatingStyles}
                className={[prefix('__panel'), className].filter(Boolean).join(' ')}
                shadow="lg"
                rounded="md"
                {...getFloatingProps({
                    onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Escape') {
                            setOpened(false);

                            (refs.reference.current as HTMLElement | null)?.focus();
                        }
                    },
                })}
            >
                {children}
            </Box>
        );
    },
);

PopoverPanel.displayName = 'PopoverPanel';

// ---------------------------------------------------------------------------
// Compound API
// ---------------------------------------------------------------------------

Popover.Trigger = PopoverTrigger;
Popover.Panel = PopoverPanel;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Popover };

export type { PopoverProps, PopoverTriggerProps, PopoverPanelProps, triggerRenderProps };
