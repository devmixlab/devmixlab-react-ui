import React, { forwardRef, useEffect, useRef } from 'react';

import { createPortal } from 'react-dom';
import clsx from 'clsx';

import { Box, BoxComponentProps } from '../Box/Box';

import { mergeRefs } from '../utils/mergeRefs';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useStableId } from '../utils/useStableId';

import { Close as CloseIcon } from '../Icon';

import { classPrefix } from '../utils/classPrefix';

const prefix = (name = '') => classPrefix(`--offcanvas${name}`);

export type OffcanvasPlacement = 'left' | 'right' | 'top' | 'bottom';

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
};

const OffcanvasRoot = forwardRef<HTMLDivElement, OffcanvasProps>(
    (
        {
            children,
            opened = false,
            onClose,
            placement = 'left',
            size = 320,
            closeOnOverlayClick = true,
            closeOnEscape = true,
            portalContainer,
            className,
        },
        ref,
    ) => {
        const panelRef = useRef<HTMLDivElement>(null);

        useFocusTrap({
            active: opened,
            containerRef: panelRef,
            onEscape: closeOnEscape ? onClose : undefined,
        });

        useEffect(() => {
            if (!opened) {
                return;
            }

            const previousOverflow = document.body.style.overflow;

            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = previousOverflow;
            };
        }, [opened]);

        if (!opened) {
            return null;
        }

        const panelStyle =
            placement === 'left' || placement === 'right'
                ? {
                      width: size,
                  }
                : {
                      height: size,
                  };

        return createPortal(
            <div className={prefix()}>
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
                    data-placement={placement}
                    style={panelStyle}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
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
