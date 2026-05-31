import React, { forwardRef, useEffect, useRef, CSSProperties } from 'react';

import { createPortal } from 'react-dom';
import clsx from 'clsx';

import { Box, BoxComponentProps, BoxProps } from '../Box/Box';

import { mergeRefs } from '../utils/mergeRefs';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePresence } from '../hooks/usePresence';
import { useStableId } from '../utils/useStableId';
import { OffcanvasProvider, useOffcanvasContext } from './Offcanvas.context';

import { Close as CloseIcon } from '../Icon';

import { classPrefix } from '../utils/classPrefix';
import {
    useEscapeKey,
    useFocusOutside,
    useNestedLayers,
    useAutoFocus,
    useRestoreFocus,
    useWindowBlur,
} from '../hooks';
import { NestedLayersHook } from '../hooks/useNestedLayers';

const prefix = (name = '') => classPrefix(`--offcanvas${name}`);

export type OffcanvasPlacement = 'left' | 'right' | 'top' | 'bottom';

type OffcanvasEffect = 'scale' | 'slide' | 'none';

export const semanticSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

export type OffcanvasSemanticSize = (typeof semanticSizes)[number];

export type OffcanvasSize = OffcanvasSemanticSize | BoxProps['size'];

export type OffcanvasProps = {
    children?: React.ReactNode;

    opened?: boolean;

    onClose?: () => void;

    placement?: OffcanvasPlacement;

    size?: OffcanvasSize;

    closeOnOverlayClick?: boolean;

    closeOnEscape?: boolean;

    portalContainer?: HTMLElement;

    className?: string;

    animationEnterDuration?: number;
    animationExitDuration?: number;
    enterAnimationEasing?: string;
    exitAnimationEasing?: string;

    /** Called when the modal has fully entered (animation complete). */
    onAnimationEntered?: () => void;
    /** Called when the modal has fully exited (animation complete, just before unmount). */
    onAnimationExited?: () => void;

    animationEffect?: OffcanvasEffect;

    modal?: boolean;
};

const OffcanvasRoot = forwardRef<HTMLDivElement, OffcanvasProps>(
    (
        {
            children,
            opened = false,
            onClose,
            placement = 'right',
            size = 'xl',
            closeOnOverlayClick = true,
            closeOnEscape = true,
            portalContainer,
            className,

            animationEnterDuration = 300,
            animationExitDuration = 300,
            enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
            exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',

            onAnimationEntered,
            onAnimationExited,

            animationEffect = 'slide',

            modal = false,
        },
        ref,
    ) => {
        const panelRef = useRef<HTMLDivElement>(null);

        // ── Presence ─────────────────────────────────────────────────────────
        const { isMounted, state: animationState } = usePresence({
            present: opened,
            enterDuration: animationEffect == 'none' ? 0 : animationEnterDuration,
            exitDuration: animationEffect == 'none' ? 0 : animationExitDuration,
            onEntered: onAnimationEntered,
            onExited: onAnimationExited,
        });

        const nestedLayers = useNestedLayers();

        const { isInsideNestedLayer, createNestedLayerRef, nestedLayersRef } = nestedLayers;

        useFocusTrap({
            active: isMounted && modal,
            containerRef: panelRef,
            nestedLayersRef,
            // onEscape: closeOnEscape ? onClose : undefined,
        });

        useWindowBlur({
            active: isMounted && !modal,
            onBlur: () => onClose?.(),
        });

        useFocusOutside({
            active: isMounted && !modal,

            containerRef: panelRef,

            onOutsideFocus: (event) => {
                requestAnimationFrame(() => {
                    const activeElement = document.activeElement;

                    if (!(activeElement instanceof HTMLElement)) {
                        return;
                    }

                    const isInsideContainer = panelRef.current?.contains(activeElement);

                    if (isInsideContainer) {
                        return;
                    }

                    if (isInsideNestedLayer(activeElement)) {
                        return;
                    }

                    onClose?.();
                });
                // onClose?.();
            },
        });

        useAutoFocus({
            active: !modal && isMounted,
            containerRef: panelRef,
            // initialFocusRef: inputRef,
        });

        useEscapeKey({
            active: opened,
            containerRef: panelRef,
            onEscape: () => {
                onClose?.();
            },
        });

        useRestoreFocus({
            active: opened,
            containerRef: panelRef,
        });

        useEffect(() => {
            if (!isMounted) {
                return;
            }

            const previousOverflow = document.body.style.overflow;

            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = previousOverflow;
            };
        }, [isMounted]);

        // if (!opened) {
        //     return null;
        // }

        if (!isMounted) return null;

        const isVertical = placement === 'top' || placement === 'bottom';

        const semanticSize = semanticSizes.includes(size as OffcanvasSemanticSize)
            ? size
            : undefined;

        const panelWidth = !isVertical ? size : undefined;
        const panelHeight = isVertical ? size : undefined;

        return createPortal(
            <OffcanvasProvider value={{ nestedLayers, onClose }}>
                <div
                    className={prefix()}
                    data-animation-state={animationState}
                    style={
                        {
                            '--animation-enter-duration': animationEnterDuration + 'ms',
                            '--animation-exit-duration': animationExitDuration + 'ms',
                            '--animation-enter-easing': enterAnimationEasing,
                            '--animation-exit-easing': exitAnimationEasing,
                        } as CSSProperties
                    }
                >
                    <div
                        className={prefix('__overlay')}
                        onClick={() => {
                            if (closeOnOverlayClick) {
                                onClose?.();
                            }
                        }}
                    />

                    <Box
                        ref={mergeRefs(panelRef, ref)}
                        className={clsx(prefix('__panel'), className)}
                        w={semanticSize == null ? panelWidth : undefined}
                        h={semanticSize == null ? panelHeight : undefined}
                        role="dialog"
                        aria-modal="true"
                        tabIndex={modal ? -1 : undefined}
                        data-animation-effect={animationEffect}
                        data-animation-state={animationState}
                        data-placement={placement}
                        data-size={semanticSize}
                        data-orientation={isVertical ? 'vertical' : 'horizontal'}
                    >
                        <Box display="flex" flexDirection="column" h="100%">
                            {children}
                        </Box>
                    </Box>
                </div>
            </OffcanvasProvider>,
            portalContainer ?? document.body,
        );
    },
);

type SectionRenderProps = {
    createNestedLayerRef: () => (node: HTMLElement | null) => void;
};

type SectionProps = {
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
    render?: (props: SectionRenderProps) => React.ReactNode;
};

const OffcanvasHeader = ({ children, className, closeButton, render }: SectionProps) => {
    const { nestedLayers, onClose } = useOffcanvasContext();
    const { createNestedLayerRef } = nestedLayers;

    return (
        <Box className={clsx(prefix('__header'), className)}>
            {render ? (
                render({ createNestedLayerRef })
            ) : (
                <>
                    <div>{children}</div>

                    {closeButton && (
                        <button
                            onClick={() => onClose?.()}
                            type="button"
                            className={prefix('__close')}
                        >
                            <CloseIcon />
                        </button>
                    )}
                </>
            )}
        </Box>
    );
};

const OffcanvasFooter = ({ children, className, render }: SectionProps) => {
    const { nestedLayers } = useOffcanvasContext();
    const { createNestedLayerRef } = nestedLayers;

    return (
        <Box className={clsx(prefix('__footer'), className)}>
            {render ? render({ createNestedLayerRef }) : children}
        </Box>
    );
};

const OffcanvasBody = ({ children, className, render }: SectionProps) => {
    const { nestedLayers } = useOffcanvasContext();

    const { createNestedLayerRef } = nestedLayers;

    return (
        <Box className={clsx(prefix('__body'), className)}>
            {render ? render({ createNestedLayerRef }) : children}
        </Box>
    );
};

type OffcanvasComponent = typeof OffcanvasRoot & {
    Header: typeof OffcanvasHeader;
    Body: typeof OffcanvasBody;
    Footer: typeof OffcanvasFooter;
};

export const Offcanvas = OffcanvasRoot as OffcanvasComponent;

Offcanvas.Header = OffcanvasHeader;
Offcanvas.Body = OffcanvasBody;
Offcanvas.Footer = OffcanvasFooter;
