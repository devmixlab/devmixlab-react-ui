import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../Icon';
import { useStableId } from '../utils/useStableId';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullscreen';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export type ModalProps = {
    children?: React.ReactNode;

    id?: string;

    size?: Size;
    placement?: 'top' | 'center';

    separated?: boolean;

    opened?: boolean;
    onClose?: () => void;

    closeOnOverlayClick?: boolean;

    className?: string;

    zIndex?: number;
};

type ModalComponent = React.ForwardRefExoticComponent<
    ModalProps & React.RefAttributes<HTMLDivElement>
> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

const prefix = (name: string = '') => {
    return classPrefix(`--modal${name}`);
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            children,

            id,

            size = 'md',
            placement = 'center',

            opened = false,
            separated = true,
            onClose,

            closeOnOverlayClick = true,

            className,

            zIndex = 1000,
        },
        ref,
    ) => {
        const contentRef = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            if (!opened) return;

            const previousFocusedElement = document.activeElement as HTMLElement | null;

            const modal = contentRef.current;

            if (!modal) return;

            const getFocusableElements = () => {
                return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                    (element) => {
                        return !element.hasAttribute('disabled') && element.tabIndex !== -1;
                    },
                );
            };

            const focusableElements = getFocusableElements();

            focusableElements[0]?.focus();

            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose?.();
                    return;
                }

                if (e.key !== 'Tab') return;

                const elements = getFocusableElements();

                if (!elements.length) {
                    e.preventDefault();
                    return;
                }

                const firstElement = elements[0];
                const lastElement = elements[elements.length - 1];

                const activeElement = document.activeElement;

                if (e.shiftKey) {
                    if (activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            window.addEventListener('keydown', onKeyDown);

            return () => {
                window.removeEventListener('keydown', onKeyDown);

                previousFocusedElement?.focus();
            };
        }, [opened, onClose]);

        useEffect(() => {
            if (!opened) return;

            const originalOverflow = document.body.style.overflow;

            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }, [opened]);

        const modalId = id ?? useStableId('modal');

        const headerId = `${modalId}-header`;
        const bodyId = `${modalId}-body`;

        if (!opened) return null;

        return createPortal(
            <ModalContext.Provider
                value={{
                    onClose,
                    headerId,
                    bodyId,
                }}
            >
                <Box
                    className={prefix()}
                    position="fixed"
                    inset={0}
                    zIndex={zIndex}
                    data-size={size}
                    data-placement={placement}
                    data-separated={separated || undefined}
                >
                    <div className={prefix('__overlay')} />

                    <div
                        className={prefix('__content-wrapper')}
                        onClick={() => {
                            if (!closeOnOverlayClick) return;

                            onClose?.();
                        }}
                    >
                        <div
                            ref={(node) => {
                                contentRef.current = node;

                                if (typeof ref === 'function') {
                                    ref(node);
                                } else if (ref) {
                                    ref.current = node;
                                }
                            }}
                            className={clsx(prefix('__content'), className)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={headerId}
                            aria-describedby={bodyId}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </Box>
            </ModalContext.Provider>,
            document.body,
        );
    },
) as ModalComponent;

Modal.displayName = 'Modal';

type ModalSectionProps = {
    children?: React.ReactNode;
    className?: string;

    closeButton?: boolean;
};

const ModalHeader = ({ children, className, closeButton = true }: ModalSectionProps) => {
    const ctx = useModalContext();

    return (
        <div id={ctx?.headerId} className={clsx(prefix('__header'), className)}>
            <div className={prefix('__header-content')}>{children}</div>

            {closeButton && ctx?.onClose && (
                <button
                    type="button"
                    className={prefix('__close')}
                    onClick={ctx.onClose}
                    aria-label="Close modal"
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    );
};

ModalHeader.displayName = 'ModalHeader';

const ModalBody = ({ children, className }: ModalSectionProps) => {
    const ctx = useModalContext();

    return (
        <div id={ctx?.bodyId} className={clsx(prefix('__body'), className)}>
            {children}
        </div>
    );
};

ModalBody.displayName = 'ModalBody';

const ModalFooter = ({ children, className }: ModalSectionProps) => {
    return <div className={clsx(prefix('__footer'), className)}>{children}</div>;
};

ModalFooter.displayName = 'ModalFooter';

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export { Modal };
