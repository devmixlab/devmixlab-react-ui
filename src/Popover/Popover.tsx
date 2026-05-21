import React, { forwardRef, useRef, useState } from 'react';
import type { Placement } from '@floating-ui/react';
import { Box } from '../Box/Box';
import { Button, type ButtonImplProps } from '../Button/Button';
import { mergeRefs } from '../utils/mergeRefs';
import { classPrefix } from '../utils/classPrefix';
import { useStableId } from '../utils/useStableId';
import { useFloatingLayer } from '../hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PopoverProps = {
    /** The floating content rendered inside the popover panel. */
    content: React.ReactNode;

    /** Controlled open state. */
    open?: boolean;

    /** Default open state for uncontrolled usage. */
    defaultOpen?: boolean;

    /** Called when the open state changes. */
    onOpenChange?: (open: boolean) => void;

    /** Where the popover floats relative to the trigger. */
    placement?: Placement;

    /** Custom trigger element. Receives `opened` and `disabled`. */
    triggerRender?: (props: { opened: boolean; disabled: boolean }) => React.ReactElement;

    /** Extra class applied to the popover panel. */
    panelClassName?: string;

    id?: string;
    className?: string;
} & Omit<ButtonImplProps, 'active'>;

type PopoverComponent = React.ForwardRefExoticComponent<
    PopoverProps & React.RefAttributes<HTMLDivElement>
> & {
    Panel: typeof PopoverPanel;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const prefix = (name: string = '') => classPrefix(`--popover${name}`);

// ---------------------------------------------------------------------------
// Popover
// ---------------------------------------------------------------------------

const Popover = forwardRef<HTMLDivElement, PopoverProps>(
    (
        {
            content,

            open,
            defaultOpen = false,
            onOpenChange,

            placement = 'bottom-start',
            type = 'button',

            disabled = false,
            rounded = 'md',
            size = 'md',

            triggerRender,
            panelClassName,

            id,
            className,
            children,

            ...rest
        },
        ref,
    ) => {
        const popoverId = id ?? useStableId('popover');

        // ------------------------------------------------------------------
        // Open state — controlled / uncontrolled
        // ------------------------------------------------------------------

        const isControlled = open !== undefined;
        const [internalOpen, setInternalOpen] = useState(defaultOpen);
        const opened = isControlled ? open! : internalOpen;

        const setOpened = (next: boolean) => {
            if (!isControlled) setInternalOpen(next);
            onOpenChange?.(next);
        };

        // ------------------------------------------------------------------
        // Trigger press / focus state
        // ------------------------------------------------------------------

        const [triggerFocusedVisible, setTriggerFocusedVisible] = useState(false);
        const [pressed, setPressed] = useState(false);

        // ------------------------------------------------------------------
        // Floating layer
        // ------------------------------------------------------------------

        const { refs, floatingStyles, getReferenceProps, getFloatingProps } = useFloatingLayer(
            opened,
            setOpened,
            placement,
        );

        const combinedRef = mergeRefs(refs.setReference, ref);

        // ------------------------------------------------------------------
        // Focus helpers
        // ------------------------------------------------------------------

        const focusTrigger = () => {
            (refs.reference.current as HTMLDivElement | null)?.focus();
        };

        const panelRef = useRef<HTMLDivElement | null>(null);

        // ------------------------------------------------------------------
        // Keyboard handler on the trigger
        // ------------------------------------------------------------------

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPressed(true);
                setOpened(!opened);
            } else if (e.key === 'Escape') {
                setOpened(false);
                focusTrigger();
            } else if (e.key === 'Tab' && opened) {
                // Let Tab move into the panel naturally; Shift+Tab from panel
                // closing is handled by dismiss (click-outside / focus-out).
            }
        };

        // ------------------------------------------------------------------
        // Render
        // ------------------------------------------------------------------

        return (
            <Box className={prefix()} data-size={size}>
                {/* Trigger */}
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
                    aria-haspopup="dialog"
                    aria-controls={opened ? popoverId : undefined}
                >
                    {triggerRender ? (
                        triggerRender({ opened, disabled })
                    ) : (
                        <Button
                            type={type}
                            disabled={disabled}
                            pseudoFocused={triggerFocusedVisible}
                            pseudoActive={pressed}
                            rounded={rounded}
                            size={size}
                            className={className}
                            active={opened}
                            {...rest}
                        >
                            {children}
                        </Button>
                    )}
                </Box>

                {/* Floating panel */}
                {opened && (
                    <Box
                        ref={(node) => {
                            refs.setFloating(node);
                            panelRef.current = node;
                        }}
                        id={popoverId}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        rounded={rounded}
                        className={[prefix('__panel'), panelClassName].filter(Boolean).join(' ')}
                        role="dialog"
                        aria-modal={false}
                        shadow="lg"
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Escape') {
                                setOpened(false);
                                focusTrigger();
                            }
                        }}
                    >
                        {content}
                    </Box>
                )}
            </Box>
        );
    },
) as PopoverComponent;

Popover.displayName = 'Popover';

// ---------------------------------------------------------------------------
// PopoverPanel — optional named slot for structured content
// ---------------------------------------------------------------------------

type PopoverPanelProps = {
    children: React.ReactNode;
    className?: string;
};

const PopoverPanel = ({ children, className }: PopoverPanelProps) => {
    return (
        <Box className={[prefix('__panel-inner'), className].filter(Boolean).join(' ')}>
            {children}
        </Box>
    );
};

PopoverPanel.displayName = 'PopoverPanel';

Popover.Panel = PopoverPanel;

export { Popover };
export type { PopoverProps, PopoverPanelProps };
