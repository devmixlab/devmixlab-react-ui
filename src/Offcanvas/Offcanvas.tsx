import React, { forwardRef, useEffect, useRef, CSSProperties } from 'react';

import { createPortal } from 'react-dom';
import clsx from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';

import { mergeRefs } from '../utils/mergeRefs';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePresence } from '../hooks/usePresence';
import { useStableId } from '../utils/useStableId';

import { Close as CloseIcon } from '../Icon';

import { classPrefix } from '../utils/classPrefix';

const prefix = (name = '') => classPrefix(`--offcanvas${name}`);

export type OffcanvasPlacement = 'left' | 'right' | 'top' | 'bottom';

type OffcanvasEffect = 'scale' | 'slide' | 'none';

export type OffcanvasSemanticSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type OffcanvasSize = OffcanvasSemanticSize | number;

export type OffcanvasProps = {
    children?: React.ReactNode;

    opened?: boolean;

    onClose?: () => void;

    placement?: OffcanvasPlacement;

    size?: number | string;

    closeOnOverlayClick?: boolean;

    closeOnEscape?: boolean;

    portalContainer?: HTMLElement;

    className?: string;

    animationEnterDuration?: number;
    animationExitDuration?: number;
    enterAnimationEasing?: string;
    exitAnimationEasing?: string;

    animationEffect?: OffcanvasEffect;
};

const OffcanvasRoot = forwardRef<HTMLDivElement, OffcanvasProps>(
    (
        {
            children,
            opened = false,
            onClose,
            placement = 'right',
            size = 320,
            closeOnOverlayClick = true,
            closeOnEscape = true,
            portalContainer,
            className,

            animationEnterDuration = 300,
            animationExitDuration = 300,
            enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
            exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',

            animationEffect = 'slide',
        },
        ref,
    ) => {
        const panelRef = useRef<HTMLDivElement>(null);

        // ── Presence ─────────────────────────────────────────────────────────
        const { isMounted, state: animationState } = usePresence({
            present: opened,
            enterDuration: animationEffect == 'none' ? 0 : animationEnterDuration,
            exitDuration: animationEffect == 'none' ? 0 : animationExitDuration,
            // exitDuration: animationDuration,
            // onEntered: onAnimationEntered,
            // onExited: onAnimationExited,
        });

        useFocusTrap({
            active: opened,
            containerRef: panelRef,
            onEscape: closeOnEscape ? onClose : undefined,
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

        const panelStyle =
            placement === 'left' || placement === 'right'
                ? {
                      width: size,
                  }
                : {
                      height: size,
                  };

        return createPortal(
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
                    style={panelStyle}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    data-animation-effect={animationEffect}
                    data-animation-state={animationState}
                    data-placement={placement}
                >
                    <Box display="flex" flexDirection="column" h="100%">
                        {children}
                    </Box>
                </Box>
            </div>,
            portalContainer ?? document.body,
        );
    },
);

type SectionProps = {
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
};

const OffcanvasHeader = ({ children, className, closeButton }: SectionProps) => {
    return (
        <div className={clsx(prefix('__header'), className)}>
            <div>{children}</div>

            {closeButton && (
                <button type="button" className={prefix('__close')}>
                    <CloseIcon />
                </button>
            )}
        </div>
    );
};

const OffcanvasFooter = ({ children, className }: SectionProps) => {
    return <div className={clsx(prefix('__footer'), className)}>{children}</div>;
};

const OffcanvasBody = ({ children, className }: SectionProps) => {
    return <div className={clsx(prefix('__body'), className)}>{children}</div>;
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
