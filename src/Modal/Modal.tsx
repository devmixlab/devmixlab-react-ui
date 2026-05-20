import React, { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../Icon';
import { useStableId } from '../utils/useStableId';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullscreen';

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
        if (!opened) return null;

        useEffect(() => {
            if (!opened) return;

            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose?.();
                }
            };

            window.addEventListener('keydown', onKeyDown);

            return () => {
                window.removeEventListener('keydown', onKeyDown);
            };
        }, [opened, onClose]);

        const modalId = id ?? useStableId('modal');

        const headerId = `${modalId}-header`;
        const bodyId = `${modalId}-body`;

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
                            ref={ref}
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
