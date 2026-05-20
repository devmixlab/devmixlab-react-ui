import React, {
    forwardRef,
    useEffect,
    useRef,
    useLayoutEffect,
    useState,
    useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { Box } from '../Box/Box';
import { classPrefix } from '../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../Icon';
import { useStableId } from '../utils/useStableId';
import { getNextZIndex } from '../utils/zIndex';
import { modalManager } from './Modal.manager';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullscreen';

/**
 * The four phases of the modal animation lifecycle:
 *
 *  opened=true  → 'entering' (first paint) → 'entered' (after animationDuration)
 *  opened=false → 'exiting'  (on next tick) → 'exited'  (after animationDuration, unmounts)
 *
 * These values are forwarded to the DOM as `data-animation-state` on both the
 * overlay and the content wrapper, so CSS / SCSS can drive transitions:
 *
 *   .__modal__overlay[data-animation-state='entering'] { opacity: 0; }
 *   .__modal__overlay[data-animation-state='entered']  { opacity: 1; transition: opacity 200ms ease; }
 *   .__modal__overlay[data-animation-state='exiting']  { opacity: 0; transition: opacity 200ms ease; }
 */
export type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

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

    /**
     * Duration (ms) of the enter and exit animations.
     * The modal stays mounted for this long after `opened` becomes false so the
     * exit animation can finish before the DOM node is removed.
     * @default 200
     */
    animationDuration?: number;

    /**
     * Called when the modal has fully entered (animation complete).
     */
    onAnimationEntered?: () => void;

    /**
     * Called when the modal has fully exited (animation complete, just before unmount).
     */
    onAnimationExited?: () => void;
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

            zIndex,

            animationDuration = 200,
            onAnimationEntered,
            onAnimationExited,
        },
        ref,
    ) => {
        const contentRef = useRef<HTMLDivElement | null>(null);
        const zIndexRef = useRef(zIndex ?? getNextZIndex('modal'));
        // Stable numeric ID used as the key into every ModalManager registry.
        const modalIdRef = useRef(Math.random());

        // ── Animation lifecycle ──────────────────────────────────────────────
        //
        // `shouldRender` keeps the portal in the DOM during the exit animation.
        // `animationState` drives `data-animation-state` on the DOM nodes.
        //
        const [animationState, setAnimationState] = useState<AnimationState>(() =>
            opened ? 'entering' : 'exited',
        );
        const [shouldRender, setShouldRender] = useState(opened);

        const rafRef = useRef<number | null>(null);
        const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        const cancelPending = useCallback(() => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        }, []);

        useEffect(() => {
            if (opened) {
                cancelPending();
                setShouldRender(true);
                setAnimationState('entering');

                // Wait for the browser to paint the 'entering' frame before
                // advancing to 'entered' so CSS transitions have a from-state.
                rafRef.current = requestAnimationFrame(() => {
                    rafRef.current = null;
                    timerRef.current = setTimeout(() => {
                        timerRef.current = null;
                        setAnimationState('entered');
                        onAnimationEntered?.();
                    }, animationDuration);
                });
            } else {
                cancelPending();

                setAnimationState((current) => {
                    if (current === 'exited') return current;

                    timerRef.current = setTimeout(() => {
                        timerRef.current = null;
                        setAnimationState('exited');
                        setShouldRender(false);
                        onAnimationExited?.();
                    }, animationDuration);

                    return 'exiting';
                });
            }

            return cancelPending;
        }, [opened, animationDuration, cancelPending, onAnimationEntered, onAnimationExited]);

        // ── Modal stack ──────────────────────────────────────────────────────
        // Registers this instance with the manager so Escape-key routing knows
        // which modal is on top.
        useEffect(() => {
            if (!opened) return;
            const id = modalIdRef.current;
            modalManager.push(id);
            return () => modalManager.remove(id);
        }, [opened]);

        // ── Scroll lock ──────────────────────────────────────────────────────
        // The manager's counter ensures the lock is applied on the first open
        // and released only when the last modal closes.
        useEffect(() => {
            if (!opened) return;
            modalManager.acquire();
            return () => modalManager.release();
        }, [opened]);

        // ── Focus management ─────────────────────────────────────────────────
        // captureFocus runs before the modal moves focus into itself; restoreFocus
        // runs when opened becomes false. The manager maps each modal ID to its
        // captured element, so nested modals each restore to the right target.
        useEffect(() => {
            const id = modalIdRef.current;
            if (opened) {
                modalManager.captureFocus(id);
            } else {
                modalManager.restoreFocus(id);
            }
        }, [opened]);

        useLayoutEffect(() => {
            if (!shouldRender) return;

            const modal = contentRef.current;
            if (!modal) return;

            const getFocusableElements = () =>
                Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
                    (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
                );

            // Move focus into the modal.
            const focusableElements = getFocusableElements();
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            } else {
                modal.focus();
            }

            const onKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    if (!modalManager.isTop(modalIdRef.current)) return;
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
            };
        }, [shouldRender, onClose]);

        // ── Stable IDs ───────────────────────────────────────────────────────
        const modalId = id ?? useStableId('modal');
        const headerId = `${modalId}-header`;
        const bodyId = `${modalId}-body`;

        if (!shouldRender) return null;

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
                            ref={(node) => {
                                contentRef.current = node;
                                if (typeof ref === 'function') {
                                    ref(node);
                                } else if (ref) {
                                    ref.current = node;
                                }
                            }}
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
