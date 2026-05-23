import React, {
    CSSProperties,
    forwardRef,
    useMemo,
    useState,
    useLayoutEffect,
    useCallback,
} from 'react';
import {
    FloatingTree,
    FloatingPortal,
    FloatingFocusManager,
    FloatingNode,
} from '@floating-ui/react';
import type { Placement } from '@floating-ui/react';
import { Box, BoxProps } from '../Box/Box';
import { mergeRefs } from '../utils/mergeRefs';
import { classPrefix } from '../utils/classPrefix';
import { useStableId } from '../utils/useStableId';
import { useFloatingLayer, usePresence } from '../hooks';
import { PopoverContext, usePopoverContext, type PopoverContextValue } from './Popover.context';
import { Button } from '../Button/Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverPanelSize = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export type PopoverRole = 'dialog' | 'menu' | 'listbox';

type PopoverProps = {
    children: React.ReactNode;

    tree?: boolean;
    role?: PopoverRole;

    // State
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    disabled?: boolean;

    /**
     * Placement of panel.
     */
    placement?: Placement;
    /**
     * Distance between trigger and panel.
     */
    offset?: number;

    /**
     * Whether pressing Escape closes the popover.
     */
    closeOnEscape?: boolean;

    /**
     * Whether clicking outside closes the popover.
     */
    closeOnOutsideClick?: boolean;

    /**
     * Whether focus should be trapped inside the popover.
     */
    modal?: boolean;

    /**
     * Duration (ms) of the enter animations.
     * @default 200
     */
    enterDuration?: number;
    /**
     * Duration (ms) of the exit animations.
     * The modal stays mounted for this long after `opened` becomes false so the
     * exit animation can finish before the DOM node is removed.
     * @default 200
     */
    exitDuration?: number;
    /** Called when the modal has fully entered (animation complete). */
    onAnimationEntered?: () => void;
    /** Called when the modal has fully exited (animation complete, just before unmount). */
    onAnimationExited?: () => void;

    onMount?: () => void;
    onUnmount?: () => void;
    onReady?: () => void;
};

type TriggerRenderProps = {
    disabled: boolean;
    opened: boolean;
    focusedVisible: boolean;
    pressed: boolean;
};

// type PopoverTriggerProps = {
//     className?: string;
//     children?: React.ReactNode;
//     chevron?: boolean;
//     render?: (props: TriggerRenderProps) => React.ReactNode;
// };
type PopoverTriggerProps = React.HTMLAttributes<HTMLDivElement> & {
    className?: string;
    children?: React.ReactNode;
    chevron?: boolean;
    render?: (props: TriggerRenderProps) => React.ReactNode;
};

type PopoverPanelProps = {
    children: React.ReactNode;
    className?: string;

    /**
     * Makes panel width match trigger width.
     */
    matchTriggerWidth?: boolean;
} & BoxProps;

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

            tree = false,
            role = 'dialog',

            open,
            defaultOpen = false,
            onOpenChange,

            disabled = false,

            placement = 'bottom-start',
            offset = 8,

            closeOnEscape = true,
            closeOnOutsideClick = true,

            modal = false,

            enterDuration = 0,
            exitDuration = 200,
            onAnimationEntered,
            onAnimationExited,

            onMount,
            onUnmount,
            onReady,
        },
        ref,
    ) => {
        const isControlled = open !== undefined;

        const [internalOpen, setInternalOpen] = useState(defaultOpen);

        const opened = isControlled ? open : internalOpen;

        // ── Presence ──────────────────────────────────────────────────────
        const { isMounted, state: animationState } = usePresence({
            present: opened,
            enterDuration,
            exitDuration,
            onEntered: onAnimationEntered,
            onExited: onAnimationExited,
            onMount,
            onUnmount,
        });

        const setOpened = (next: boolean) => {
            if (!isControlled) {
                setInternalOpen(next);
            }

            onOpenChange?.(next);
        };

        const triggerId = useStableId('popover-trigger');
        const panelId = useStableId('popover-panel');

        const { context, refs, floatingStyles, getReferenceProps, getFloatingProps, nodeId } =
            useFloatingLayer({
                opened,
                onOpenChange: setOpened,
                placement,
                offsetValue: offset,
                closeOnOutsideClick,
                closeOnEscape,
            });

        const value = useMemo<PopoverContextValue>(
            () => ({
                opened,
                setOpened,

                disabled,

                refs,
                context,
                floatingStyles,

                getReferenceProps,
                getFloatingProps,

                triggerId,
                panelId,
                role,

                modal,

                isMounted,
                animationState,

                onReady,
            }),
            [
                opened,
                disabled,
                refs,
                context,
                floatingStyles,
                getReferenceProps,
                getFloatingProps,
                triggerId,
                panelId,
                role,
                modal,
                isMounted,
                animationState,
                onReady,
            ],
        );

        const content = (
            <FloatingNode id={nodeId}>
                <PopoverContext.Provider value={value}>
                    <Box ref={ref} className={prefix()}>
                        {children}
                    </Box>
                </PopoverContext.Provider>
            </FloatingNode>
        );

        if (tree) {
            return <FloatingTree>{content}</FloatingTree>;
        }

        return content;
    },
) as PopoverComponent;

Popover.displayName = 'Popover';

const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
    ({ children, className, chevron = false, render, ...rest }, ref) => {
        const {
            opened,
            setOpened,

            disabled,
            role,

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
                {...rest}
                ref={combinedRef}
                id={triggerId}
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
                    rest.onKeyDown?.(e);
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
                aria-haspopup={role}
            >
                {render ? (
                    render({
                        disabled: !!disabled,
                        opened,
                        focusedVisible: triggerFocusedVisible,
                        pressed,
                    })
                ) : (
                    <Button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        pseudoFocused={triggerFocusedVisible}
                        pseudoActive={pressed}
                        className={clsx(prefix('__trigger-button'), className)}
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
    (
        { children, className, matchTriggerWidth = false, shadow = 'lg', rounded = 'md', ...rest },
        ref,
    ) => {
        const {
            role,
            modal,

            refs,
            context,
            floatingStyles,
            getFloatingProps,

            triggerId,
            panelId,

            isMounted,
            animationState,

            onReady,
        } = usePopoverContext();

        // ── Unmount after exit animation ─────────────────────────────────
        if (!isMounted) {
            return null;
        }

        // useLayoutEffect(() => {
        //     if (!refs.floating.current) return;
        //
        //     queueMicrotask(() => {
        //         onReady?.();
        //     });
        // }, [isMounted, refs.floating, onReady]);

        const handleFloatingRef = useCallback(
            (node: HTMLDivElement | null) => {
                refs.setFloating(node);

                if (!node) return;

                queueMicrotask(() => {
                    onReady?.();
                });
            },
            [refs, onReady],
        );

        return (
            <FloatingPortal>
                <FloatingFocusManager
                    context={context}
                    modal={modal}
                    initialFocus={modal ? 0 : -1}
                    // returnFocus={modal}
                >
                    <Box
                        // ref={mergeRefs(refs.setFloating, ref)}
                        ref={mergeRefs(handleFloatingRef, ref)}
                        id={panelId}
                        role={role}
                        tabIndex={-1}
                        aria-modal={modal || undefined}
                        // aria-modal={role === 'dialog' ? false : undefined}
                        aria-labelledby={role === 'dialog' ? triggerId : undefined}
                        style={
                            {
                                ...floatingStyles,
                                '--popover-trigger-width': refs.reference.current
                                    ? `${refs.reference.current.getBoundingClientRect().width}px`
                                    : undefined,
                                // left: '1rem',
                                // right: '1rem',
                                // width: 'calc(100vw - 2rem)',
                            } as CSSProperties
                        }
                        className={[prefix('__panel'), className].filter(Boolean).join(' ')}
                        shadow={shadow}
                        rounded={rounded}
                        {...getFloatingProps()}
                        data-animation-state={animationState}
                        data-match-trigger-width={matchTriggerWidth || undefined}
                        {...rest}
                    >
                        {children}
                    </Box>
                </FloatingFocusManager>
            </FloatingPortal>
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

export type { PopoverProps, PopoverTriggerProps, PopoverPanelProps, TriggerRenderProps };
