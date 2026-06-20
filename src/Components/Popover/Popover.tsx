import React, {
    CSSProperties,
    forwardRef,
    useMemo,
    useState,
    useLayoutEffect,
    useCallback,
    useRef,
    useEffect,
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
import { usePopoverStateContext } from './PopoverState.context';
import { usePopoverInteractionContext } from './PopoverInteraction.context';
import { usePopoverFloatingContext } from './PopoverFloating.context';
import { usePopoverAccessibilityContext } from './PopoverAccessibility.context';
import { usePopoverConfigContext } from './PopoverConfig.context';
import { PopoverProviders } from './PopoverProviders';
import { Button, ButtonProps } from '../Button';
import { ChevronDown as ChevronDownIcon } from '../Icon';
import { clsx } from 'clsx';

export const BUTTON_ICON_SLOT_WIDTHS = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PopoverChevron = 'rotate' | 'fixed' | 'none';

export type PopoverTriggerMode = 'click' | 'hover';

export type BackdropVariant = 'transparent' | 'blur' | 'dim';

export type PopoverAnimation = 'none' | 'fade' | 'scale' | 'slide' | 'scale-fade' | 'slide-fade';

export type PopoverVariant = 'solid' | 'glass' | 'gradient' | (string & {});

export type PopoverRole = 'dialog' | 'menu' | 'listbox';

type PopoverProps = {
    children: React.ReactNode;

    tree?: boolean;
    role?: PopoverRole;

    variant?: PopoverVariant;
    animation?: PopoverAnimation;

    trigger?: PopoverTriggerMode;
    interactive?: boolean;

    arrow?: boolean;
    arrowSize?: number;
    arrowInset?: number | string;
    arrowShift?: number | string;
    arrowCenter?: boolean;

    /**
     * Delay before opening when trigger="hover".
     * @default 100
     */
    openDelay?: number;

    /**
     * Delay before closing when trigger="hover".
     * @default 100
     */
    closeDelay?: number;

    // State
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;

    disabled?: boolean;

    /**
     * Placement of panel.
     */
    placement?: Placement;
    onPlacementChange?: (placement: Placement) => void;

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
     * Renders a backdrop behind the panel.
     */
    backdrop?: boolean;

    /**
     * Backdrop opacity/color variant.
     */
    backdropVariant?: BackdropVariant;

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

type PopoverTriggerRenderProps = {
    disabled: boolean;
    opened: boolean;
    triggerClassName: string;
    triggerProps: PopoverTriggerElementProps;
    content?: any;
    // focusedVisible: boolean;
    // pressed: boolean;
};

type PopoverTriggerProps<T = {}> = React.HTMLAttributes<HTMLElement> & {
    className?: string;
    children?: React.ReactNode;
    chevron?: PopoverChevron;
    render?: (props: PopoverTriggerRenderProps) => React.ReactNode;
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

    trigger = 'click',
    interactive = true,

    arrow = false,
    arrowSize = 8,
    arrowInset: arrowInsetProp = 16,
    arrowShift: arrowShiftProp = 0,
    arrowCenter,

    openDelay = 100,
    closeDelay = 100,

    open,
    defaultOpen = false,
    onOpenChange,

    disabled = false,

    placement = 'bottom-start',
    // placement = 'left-start',
    onPlacementChange,

    offset = 8,

    closeOnEscape = true,
    closeOnOutsideClick = true,

    modal = false,
    backdrop = false,
    backdropVariant = 'blur',
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
    const arrowInset = arrowCenter ? '50%' : arrowInsetProp;
    const arrowShift = arrowCenter ? '-50%' : arrowShiftProp;

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

    const setOpened = useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setInternalOpen(next);
            }

            onOpenChange?.(next);
        },
        [isControlled, onOpenChange],
    );

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

    useEffect(() => {
        onPlacementChange?.(resolvedPlacement);
    }, [resolvedPlacement, onPlacementChange]);

    const openTimeoutRef = useRef<number>();
    const closeTimeoutRef = useRef<number>();

    useLayoutEffect(() => {
        return () => {
            clearTimeout(openTimeoutRef.current);
            clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    const handleHoverEnter = useCallback(() => {
        clearTimeout(closeTimeoutRef.current);

        openTimeoutRef.current = window.setTimeout(() => {
            setOpened(true);
        }, openDelay);
    }, [setOpened, openDelay]);

    const handleHoverLeave = useCallback(() => {
        clearTimeout(openTimeoutRef.current);

        closeTimeoutRef.current = window.setTimeout(() => {
            setOpened(false);
        }, closeDelay);
    }, [setOpened, closeDelay]);

    const stateValue = useMemo(
        () => ({
            opened,
            setOpened,
            isMounted,
            animationState,
        }),
        [opened, setOpened, isMounted, animationState],
    );

    const interactionValue = useMemo(
        () => ({
            trigger,
            interactive,
            openDelay,
            closeDelay,
            disabled,
            handleHoverEnter,
            handleHoverLeave,
        }),
        [trigger, openDelay, closeDelay, disabled, handleHoverEnter, handleHoverLeave],
    );

    const floatingValue = useMemo(
        () => ({
            refs,
            context,
            floatingStyles,
            getReferenceProps,
            getFloatingProps,
            placement: resolvedPlacement,
        }),
        [refs, context, floatingStyles, getReferenceProps, getFloatingProps, resolvedPlacement],
    );

    const accessibilityValue = useMemo(
        () => ({
            triggerId,
            panelId,
            role,
        }),
        [triggerId, panelId, role],
    );

    const configValue = useMemo(
        () => ({
            variant,

            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,

            modal,
            backdrop,
            backdropVariant,

            closeOnOutsideClick,
            returnFocus,

            onReady,
            keepMounted,

            arrow,
            arrowSize,
            arrowInset,
            arrowShift,
        }),
        [
            variant,

            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,

            modal,
            backdrop,
            backdropVariant,

            closeOnOutsideClick,
            returnFocus,

            onReady,
            keepMounted,

            arrow,
            arrowSize,
            arrowInset,
            arrowShift,
        ],
    );

    const content = (
        <FloatingNode id={nodeId}>
            {/*<PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>*/}
            <PopoverProviders
                state={stateValue}
                floating={floatingValue}
                interaction={interactionValue}
                accessibility={accessibilityValue}
                config={configValue}
            >
                {children}
            </PopoverProviders>
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
            chevron = 'none',
            render,
            btnProps,
            onClick,
            onKeyDown,
            onMouseEnter,
            onMouseLeave,
            renderContent,
            ...rest
        },
        ref,
    ) => {
        const { opened, setOpened } = usePopoverStateContext();

        const { disabled, trigger, handleHoverEnter, handleHoverLeave } =
            usePopoverInteractionContext();

        const { refs, getReferenceProps, placement } = usePopoverFloatingContext();

        const { triggerId, panelId, role } = usePopoverAccessibilityContext();

        const combinedRef = mergeRefs(refs.setReference, ref);

        const handleKeyDown = useCallback(
            (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpened(!opened);
                }
            },
            [opened, setOpened],
        );

        const triggerProps = {
            ...getReferenceProps({
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    onClick?.(e);

                    if (!disabled && trigger === 'click') {
                        setOpened(!opened);
                    }
                },

                onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                    if (!disabled) {
                        handleKeyDown(e);
                    }

                    onKeyDown?.(e);
                },
                onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                    onMouseEnter?.(e);

                    if (trigger !== 'hover' || disabled) {
                        return;
                    }

                    handleHoverEnter();
                },
                onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
                    onMouseLeave?.(e);

                    if (trigger !== 'hover' || disabled) {
                        return;
                    }

                    handleHoverLeave();
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

        const isLeftPlacement = placement?.startsWith('left');

        const chevronIcon = (chevron == 'rotate' || chevron == 'fixed') && (
            <ChevronDownIcon
                className={prefix('__chevron')}
                data-opened={opened || undefined}
                data-rotate={chevron == 'rotate' || undefined}
                data-placement={placement}
                aria-hidden
            />
        );

        const buttonSize = btnProps?.size ?? 'md';

        return (
            <Button
                {...rest}
                {...triggerProps}
                iconSlotWidth={BUTTON_ICON_SLOT_WIDTHS[buttonSize]}
                className={triggerClassName}
                type="button"
                disabled={disabled}
                active={trigger === 'click' && opened}
                {...btnProps}
                // endIcon={chevronIcon}
                startIcon={isLeftPlacement ? chevronIcon : btnProps?.startIcon}
                endIcon={!isLeftPlacement ? chevronIcon : btnProps?.endIcon}
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
        {
            children,
            className,
            matchTriggerWidth = false,
            shadow = 'lg',
            rounded = 'sm',
            onMouseEnter,
            onMouseLeave,
            ...rest
        },
        ref,
    ) => {
        const { opened, setOpened, isMounted, animationState } = usePopoverStateContext();

        const { trigger, interactive, disabled, handleHoverEnter, handleHoverLeave } =
            usePopoverInteractionContext();

        const { refs, context, floatingStyles, getFloatingProps, placement } =
            usePopoverFloatingContext();

        const { triggerId, panelId, role } = usePopoverAccessibilityContext();

        const {
            variant,
            animation,
            animationEnterDuration,
            animationExitDuration,
            enterAnimationEasing,
            exitAnimationEasing,

            modal,
            backdrop,
            backdropVariant,

            closeOnOutsideClick,
            returnFocus,

            onReady,
            keepMounted,

            arrow,
            arrowSize,
            arrowInset,
            arrowShift,
        } = usePopoverConfigContext();

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
                {backdrop && opened && trigger === 'click' && (
                    <div
                        className={prefix('__backdrop')}
                        onClick={() => closeOnOutsideClick && setOpened(false)}
                        data-variant={backdropVariant}
                        data-animation-state={animationState}
                        style={
                            {
                                '--animation-enter-duration': animationEnterDuration + 'ms',
                                '--animation-exit-duration': animationExitDuration + 'ms',
                                '--animation-enter-easing': enterAnimationEasing,
                                '--animation-exit-easing': exitAnimationEasing,
                            } as CSSProperties
                        }
                    />
                )}

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
                        onMouseEnter={(e) => {
                            onMouseEnter?.(e);

                            if (!interactive) {
                                return;
                            }

                            if (trigger !== 'hover' || disabled) {
                                return;
                            }

                            handleHoverEnter();
                        }}
                        onMouseLeave={(e) => {
                            onMouseLeave?.(e);

                            if (!interactive) {
                                return;
                            }

                            if (trigger !== 'hover' || disabled) {
                                return;
                            }

                            handleHoverLeave();
                        }}
                    >
                        {arrow && (
                            <span
                                className={prefix('__arrow')}
                                aria-hidden
                                style={
                                    {
                                        '--popover-arrow-size': `${arrowSize}px`,
                                        '--popover-arrow-inset':
                                            typeof arrowInset === 'number'
                                                ? `${arrowInset}px`
                                                : arrowInset,
                                        '--popover-arrow-shift':
                                            typeof arrowShift === 'number'
                                                ? `${arrowShift}px`
                                                : arrowShift,
                                    } as React.CSSProperties
                                }
                                data-placement={placement}
                            />
                        )}

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

export type { PopoverProps, PopoverTriggerProps, PopoverPanelProps, PopoverTriggerRenderProps };
