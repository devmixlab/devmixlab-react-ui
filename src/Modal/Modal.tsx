import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../Icon';
import { useStableId } from '../utils/useStableId';
import { getNextZIndex } from '../utils/zIndex';
import { modalManager } from './Modal.manager';
import { usePresence } from '../hooks/usePresence';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { mergeRefs } from '../utils/mergeRefs';

export type { PresenceState as AnimationState } from '../hooks/usePresence';

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
    /**
     * Duration (ms) of the enter and exit animations.
     * The modal stays mounted for this long after `opened` becomes false so the
     * exit animation can finish before the DOM node is removed.
     * @default 200
     */
    animationDuration?: number;
    /** Called when the modal has fully entered (animation complete). */
    onAnimationEntered?: () => void;
    /** Called when the modal has fully exited (animation complete, just before unmount). */
    onAnimationExited?: () => void;
};

type ModalComponent = React.ForwardRefExoticComponent<
    ModalProps & React.RefAttributes<HTMLDivElement>
> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

const prefix = (name: string = '') => classPrefix(`--modal${name}`);

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
            zIndex,
            animationDuration = 200,
            onAnimationEntered,
            onAnimationExited,
        },
        forwardedRef,
    ) => {
        const contentRef = useRef<HTMLDivElement | null>(null);
        const zIndexRef = useRef(zIndex ?? getNextZIndex('modal'));
        const modalIdRef = useRef(Math.random());

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ── Presence ─────────────────────────────────────────────────────────
        const { isMounted, state: animationState } = usePresence({
            present: opened,
            duration: prefersReducedMotion ? 0 : animationDuration,
            onEntered: onAnimationEntered,
            onExited: onAnimationExited,
        });

        // ── Modal stack ──────────────────────────────────────────────────────
        useEffect(() => {
            if (!opened) return;
            const id = modalIdRef.current;
            modalManager.push(id);
            return () => modalManager.remove(id);
        }, [opened]);

        // ── Scroll lock ──────────────────────────────────────────────────────
        useEffect(() => {
            if (!opened) return;
            modalManager.acquire();
            return () => modalManager.release();
        }, [opened]);

        // ── Focus: snapshot & restore ────────────────────────────────────────
        useEffect(() => {
            const id = modalIdRef.current;
            if (opened) {
                modalManager.captureFocus(id);
            } else {
                modalManager.restoreFocus(id);
            }
        }, [opened]);

        // ── Focus trap ───────────────────────────────────────────────────────
        useFocusTrap({
            active: isMounted,
            containerRef: contentRef,
            onEscape: onClose,
            isActive: () => modalManager.isTop(modalIdRef.current),
        });

        // ── Refs ─────────────────────────────────────────────────────────────
        const mergedContentRef = mergeRefs(contentRef, forwardedRef);

        // ── Stable IDs ───────────────────────────────────────────────────────
        const modalId = id ?? useStableId('modal');
        const headerId = `${modalId}-header`;
        const bodyId = `${modalId}-body`;

        if (!isMounted) return null;

        return createPortal(
            <ModalContext.Provider value={{ onClose, headerId, bodyId }}>
                <Box
                    className={prefix()}
                    position="fixed"
                    inset={0}
                    zIndex={zIndexRef.current}
                    data-size={size}
                    data-placement={placement}
                    data-separated={separated || undefined}
                    data-animation-state={animationState}
                >
                    <div className={prefix('__overlay')} data-animation-state={animationState} />

                    <div
                        className={prefix('__content-wrapper')}
                        data-animation-state={animationState}
                        onClick={(e) => {
                            if (!closeOnOverlayClick) return;
                            if (e.target === e.currentTarget) onClose?.();
                        }}
                    >
                        <div
                            ref={mergedContentRef}
                            tabIndex={-1}
                            className={clsx(prefix('__content'), className)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={headerId}
                            aria-describedby={bodyId}
                            data-animation-state={animationState}
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

// ── Sub-components ────────────────────────────────────────────────────────────

type ModalSectionProps = {
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
};

const ModalHeader = ({ children, className, closeButton = false }: ModalSectionProps) => {
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
