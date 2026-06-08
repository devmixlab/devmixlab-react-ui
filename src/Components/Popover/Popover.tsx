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
import { Box, BoxProps, BoxComponentProps } from '../Box';
import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';
import { useStableId } from '../../utils/useStableId';
import { useFloatingLayer, usePresence } from '../../hooks';
import { PopoverContext, usePopoverContext, type PopoverContextValue } from './Popover.context';
import { Button, ButtonProps } from '../Button';
import { ChevronDown as ChevronDownIcon } from '../../Icon';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopoverAnimation = 'none' | 'fade' | 'scale' | 'slide' | 'scale-fade' | 'slide-fade';

export type PopoverVariant = 'solid' | 'glass' | 'gradient' | (string & {});

export type PopoverPanelSize = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export type PopoverRole = 'dialog' | 'menu' | 'listbox';

type PopoverProps = {
    children: React.ReactNode;

    tree?: boolean;
    role?: PopoverRole;

    variant?: PopoverVariant;
    animation?: PopoverAnimation;

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

    returnFocus?: boolean;

    /**
     * Duration (ms) of the enter animations.
     * @default 200
     */
    animationEnterDuration?: number;
    /**
     * Duration (ms) of the exit animations.
     * The modal stays mounted for this long after `opened` becomes false so the
     * exit animation can finish before the DOM node is removed.
     * @default 200
     */
    animationExitDuration?: number;

    enterAnimationEasing?: string;
    exitAnimationEasing?: string;

    /** Called when the modal has fully entered (animation complete). */
    onAnimationEntered?: () => void;
    /** Called when the modal has fully exited (animation complete, just before unmount). */
    onAnimationExited?: () => void;

    onMount?: () => void;
    onUnmount?: () => void;
    onReady?: () => void;

    keepMounted?: boolean;
};

// export type TriggerProps = Omit<React.HTMLAttributes<HTMLElement>, 'ref'> & {
//     ref?: React.Ref<HTMLElement>;
// };

export type PopoverTriggerElementProps<T extends HTMLElement = HTMLElement> = Omit<
    React.HTMLAttributes<T>,
    'ref'
> & {
    ref?: React.Ref<T>;
};

type TriggerRenderProps = {
    disabled: boolean;
    opened: boolean;
    triggerClassName: string;
    triggerProps: PopoverTriggerElementProps;
    content?: any;
    // focusedVisible: boolean;
    // pressed: boolean;
};

// type PopoverTriggerProps = {
//     className?: string;
//     children?: React.ReactNode;
//     chevron?: boolean;
//     render?: (props: TriggerRenderProps) => React.ReactNode;
// };
type PopoverTriggerProps<T = {}> = React.HTMLAttributes<HTMLElement> & {
    className?: string;
    children?: React.ReactNode;
    chevron?: boolean;
    render?: (props: TriggerRenderProps) => React.ReactNode;
    btnProps?: ButtonProps;
    renderContent?: T;
};

type PopoverPanelProps<C extends React.ElementType = 'div'> = BoxComponentProps<
    C,
    {
        children: React.ReactNode;
        className?: string;

        /**
         * Makes panel width match trigger width.
         */
        matchTriggerWidth?: boolean;
    }
>;

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

const Popover = ({
    children,

    tree = false,
    role = 'dialog',
    variant = 'solid',
    // animation = 'none',
    animation = 'scale-fade',
    // animation = 'fade',
    // animation = 'slide-fade',
    // animation = 'slide',
    // animation = 'scale',

    // export type PopoverAnimation = 'none' | 'fade' | 'scale' | 'slide' | 'scale-fade' | 'slide-fade';

    open,
    defaultOpen = false,
    onOpenChange,

    disabled = false,

    placement = 'bottom-start',
    // placement = 'left-start',
    offset = 8,

    closeOnEscape = true,
    closeOnOutsideClick = true,

    modal = false,
    returnFocus = true,

    animationEnterDuration = 120,
    animationExitDuration = 120,
    enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',

    onAnimationEntered,
    onAnimationExited,

    onMount,
    onUnmount,
    onReady,

    keepMounted = false,
}: PopoverProps) => {
    const isControlled = open !== undefined;

    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    const opened = isControlled ? open : internalOpen;

    // ── Presence ──────────────────────────────────────────────────────
    const { isMounted, state: animationState } = usePresence({
        present: opened,
        enterDuration: animation === 'none' ? 0 : animationEnterDuration,
        exitDuration: animation === 'none' ? 0 : animationExitDuration,
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

    const {
        context,
        refs,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        nodeId,
        placement: resolvedPlacement,
    } = useFloatingLayer({
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
            placement: resolvedPlacement,
            variant,
            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,

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
            returnFocus,

            isMounted,
            animationState,

            onReady,
            keepMounted,
        }),
        [
            opened,
            setOpened,
            resolvedPlacement,
            variant,
            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,
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
            returnFocus,
            isMounted,
            animationState,
            onReady,
            keepMounted,
        ],
    );

    const content = (
        <FloatingNode id={nodeId}>
            <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
        </FloatingNode>
    );

    if (tree) {
        return <FloatingTree>{content}</FloatingTree>;
    }

    return content;
};

Popover.displayName = 'Popover';

// ---------------------------------------------------------------------------
// PopoverTrigger
// ---------------------------------------------------------------------------

const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
    (
        {
            children,
            className,
            chevron = false,
            render,
            btnProps,
            onClick,
            onKeyDown,
            renderContent,
            ...rest
        },
        ref,
    ) => {
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

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpened(!opened);
            }
        };

        const triggerProps = {
            ...getReferenceProps({
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    onClick?.(e);

                    if (!disabled) {
                        setOpened(!opened);
                    }
                },

                onKeyDown: (e) => {
                    if (!disabled) {
                        handleKeyDown(e);
                    }

                    onKeyDown?.(e as React.KeyboardEvent<HTMLElement>);
                },
            }),

            ref: combinedRef,
            id: triggerId,

            'aria-expanded': opened,
            'aria-controls': opened ? panelId : undefined,
            'aria-haspopup': role,
        };

        const triggerClassName = clsx(prefix('__trigger'), className);

        if (render) {
            return render({
                disabled: !!disabled,
                opened,
                triggerClassName,
                triggerProps,
                content: renderContent,
            });
        }

        return (
            <Button
                {...rest}
                {...triggerProps}
                className={triggerClassName}
                type="button"
                disabled={disabled}
                active={opened}
                {...btnProps}
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
        );
    },
);

PopoverTrigger.displayName = 'Popover.Trigger';

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
            placement,
            variant,
            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,

            refs,
            context,
            floatingStyles,
            getFloatingProps,

            triggerId,
            panelId,

            isMounted,
            animationState,

            onReady,
            returnFocus,
            keepMounted,
            opened,
        } = usePopoverContext();

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

        // ── Unmount after exit animation ─────────────────────────────────
        if (!keepMounted && !isMounted) {
            return null;
        }

        return (
            <FloatingPortal>
                <FloatingFocusManager
                    context={context}
                    modal={modal}
                    initialFocus={modal ? 0 : -1}
                    returnFocus={returnFocus}
                >
                    <Box
                        ref={mergeRefs(handleFloatingRef, ref)}
                        id={panelId}
                        role={role}
                        tabIndex={-1}
                        aria-modal={modal || undefined}
                        // aria-modal={role === 'dialog' ? false : undefined}
                        aria-labelledby={role === 'dialog' ? triggerId : undefined}
                        aria-hidden={!isMounted || undefined}
                        style={
                            {
                                ...floatingStyles,
                                display: !isMounted ? 'none' : undefined,

                                '--animation-enter-duration': animationEnterDuration + 'ms',
                                '--animation-exit-duration': animationExitDuration + 'ms',
                                '--animation-enter-easing': enterAnimationEasing,
                                '--animation-exit-easing': exitAnimationEasing,

                                '--popover-trigger-width': refs.reference.current
                                    ? `${refs.reference.current.getBoundingClientRect().width}px`
                                    : undefined,
                            } as CSSProperties
                        }
                        className={[prefix('__panel'), className].filter(Boolean).join(' ')}
                        shadow={shadow}
                        rounded={rounded}
                        {...getFloatingProps()}
                        data-animation={animation}
                        data-animation-state={animationState}
                        data-match-trigger-width={matchTriggerWidth || undefined}
                        data-variant={variant}
                        data-placement={placement}
                        {...rest}
                    >
                        {children}
                    </Box>
                </FloatingFocusManager>
            </FloatingPortal>
        );
    },
);

PopoverPanel.displayName = 'Popover.Panel';

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
