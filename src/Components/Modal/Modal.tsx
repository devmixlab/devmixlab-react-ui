import React, {
    forwardRef,
    useEffect,
    useState,
    useRef,
    HTMLAttributes,
    CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Box, BoxProps } from '../Box';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../../Icon';
import { useStableId } from '../../utils/useStableId';
import { getNextZIndex } from '../../utils/zIndex';
import { modalManager } from './Modal.manager';
import { useFocusTrap } from '../../hooks';
import { mergeRefs } from '../../utils/mergeRefs';
import { maxWidths, widths, maxHeights, heights } from './Modal.constants';
import { sharedTransitionProps, SharedTransitionProps, Transition } from '../Transition';
import { splitProps } from '../../utils/splitProps';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

const modalSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full', 'fullscreen'] as const;

type ModalSize = (typeof modalSizes)[number];

type OwnModalProps = {
    size?: ModalSize;
    placement?: 'top' | 'center';
    separated?: boolean;
    opened?: boolean;
    onClose?: () => void;
    closeOnOverlayClick?: boolean;
    zIndex?: number;

    closeOnEscape?: boolean;
    initialFocus?: React.RefObject<HTMLElement>;
    portalContainer?: HTMLElement;
};

type BoxModalProps = {
    height?: BoxProps['height'];
    maxHeight?: BoxProps['maxHeight'];
    width?: BoxProps['width'];
    maxWidth?: BoxProps['maxWidth'];
};

type ModalProps = OwnModalProps &
    BoxModalProps &
    SharedTransitionProps &
    HTMLAttributes<HTMLDivElement>;

type ModalComponent = React.ForwardRefExoticComponent<
    ModalProps & React.RefAttributes<HTMLDivElement>
> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

const prefix = (name: string = '') => classPrefix(`--modal${name}`);

//----------------------------------------------------------------------
// Modal component
//----------------------------------------------------------------------
const Modal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            // Element props
            className,
            children,
            id,

            // Own props
            size = 'md',
            placement = 'center',
            opened = false,
            separated = true,
            onClose,
            closeOnOverlayClick = true,
            zIndex,
            closeOnEscape = true,
            initialFocus,
            portalContainer,

            // Animation props
            animation = 'scale-fade',
            respectAttentionDuration = true,
            enterDuration: animationEnterDuration = 200,
            exitDuration: animationExitDuration = 150,
            enterEasing: enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
            exitEasing: exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',
            onEntered: onAnimationEntered,

            // Box props
            height,
            maxHeight,
            width,
            maxWidth,

            ...rest
        },
        forwardedRef,
    ) => {
        const [fullyVisible, setFullyVisible] = useState(false);
        const [hasHeader, setHasHeader] = useState(false);
        const [hasBody, setHasBody] = useState(false);

        const [transitionProps, restWithoutTransitionProps] = splitProps(
            rest,
            sharedTransitionProps,
        );

        const resolvedHeight = height ?? heights[size];
        const resolvedMaxHeight = maxHeight ?? maxHeights[size];
        const resolvedWidth = width ?? widths[size];
        const resolvedMaxWidth = maxWidth ?? maxWidths[size];

        const contentRef = useRef<HTMLDivElement | null>(null);
        const zIndexRef = useRef(zIndex ?? getNextZIndex('modal'));
        const modalIdRef = useRef(Math.random());

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
            active: fullyVisible,
            containerRef: contentRef,
            onEscape: onClose,
            isActive: () => modalManager.isTop(modalIdRef.current),
            closeOnEscape,
            initialFocus,
        });

        // ── Refs ─────────────────────────────────────────────────────────────
        const mergedContentRef = mergeRefs(contentRef, forwardedRef);

        // ── Stable IDs ───────────────────────────────────────────────────────
        const modalId = id ?? useStableId('modal');
        const headerId = `${modalId}-header`;
        const bodyId = `${modalId}-body`;

        return createPortal(
            <ModalContext.Provider
                value={{ onClose, headerId, bodyId, hasHeader, setHasHeader, hasBody, setHasBody }}
            >
                <Transition
                    as={Box}
                    visible={opened}
                    animation="fade"
                    enterDuration={animationEnterDuration}
                    exitDuration={animationExitDuration}
                    onExited={() => {
                        setFullyVisible(false);
                    }}
                    className={prefix()}
                    position="fixed"
                    inset={0}
                    zIndex={zIndexRef.current}
                    data-size={size}
                    data-placement={placement}
                    data-separated={separated || undefined}
                >
                    <Transition
                        visible={opened}
                        animation="fade"
                        enterDuration={animationEnterDuration}
                        exitDuration={animationExitDuration}
                        enterEasing={enterAnimationEasing}
                        exitEasing={exitAnimationEasing}
                        className={prefix('__overlay')}
                    />

                    <div
                        className={prefix('__content-wrapper')}
                        onClick={(e) => {
                            if (!closeOnOverlayClick) return;
                            if (e.target === e.currentTarget) onClose?.();
                        }}
                    >
                        <Transition
                            {...transitionProps}
                            as={Box}
                            visible={opened}
                            animation={animation}
                            // slideOffset={-60}
                            respectAttentionDuration={respectAttentionDuration}
                            enterDuration={animationEnterDuration}
                            exitDuration={animationExitDuration}
                            enterEasing={enterAnimationEasing}
                            exitEasing={exitAnimationEasing}
                            onEntered={() => {
                                onAnimationEntered?.();
                                setFullyVisible(true);
                            }}
                            ref={mergedContentRef}
                            h={resolvedHeight}
                            maxH={resolvedMaxHeight}
                            w={resolvedWidth}
                            maxW={resolvedMaxWidth}
                            tabIndex={-1}
                            className={clsx(prefix('__content'), className)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={hasHeader ? headerId : undefined}
                            aria-describedby={hasBody ? bodyId : undefined}
                        >
                            {children}
                        </Transition>
                    </div>
                </Transition>
            </ModalContext.Provider>,
            portalContainer != null ? portalContainer : document.body,
        );
    },
) as ModalComponent;

Modal.displayName = 'Modal';

//----------------------------------------------------------------------
// ModalHeader subcomponent
//----------------------------------------------------------------------

type ModalSectionProps = {
    children?: React.ReactNode;
    className?: string;
    closeButton?: boolean;
};

const ModalHeader = ({ children, className, closeButton = false }: ModalSectionProps) => {
    const ctx = useModalContext();

    useEffect(() => {
        ctx?.setHasHeader(true);

        return () => {
            ctx?.setHasHeader(false);
        };
    }, [ctx]);

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

//----------------------------------------------------------------------
// ModalBody subcomponent
//----------------------------------------------------------------------

const ModalBody = ({ children, className }: ModalSectionProps) => {
    const ctx = useModalContext();

    useEffect(() => {
        ctx?.setHasBody(true);

        return () => {
            ctx?.setHasBody(false);
        };
    }, [ctx]);

    return (
        <div id={ctx?.bodyId} className={clsx(prefix('__body'), className)}>
            {children}
        </div>
    );
};

ModalBody.displayName = 'ModalBody';

//----------------------------------------------------------------------
// ModalFooter subcomponent
//----------------------------------------------------------------------

const ModalFooter = ({ children, className }: ModalSectionProps) => {
    return <div className={clsx(prefix('__footer'), className)}>{children}</div>;
};

ModalFooter.displayName = 'ModalFooter';

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

//----------------------------------------------------------------------
// Exports
//----------------------------------------------------------------------

export { Modal };

export type { ModalSize, OwnModalProps, ModalProps, ModalComponent };

export { modalSizes };
