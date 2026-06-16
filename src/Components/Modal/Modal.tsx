import React, { forwardRef, useEffect, useState, useRef, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Box, BoxProps, DerivedProps, BoxDerived } from '../Box';
import { classPrefix } from '../../utils/classPrefix';
import clsx from 'clsx';
import { ModalContext, useModalContext } from './Modal.context';
import { Close as CloseIcon } from '../../Icon';
import { useStableId } from '../../utils/useStableId';
import { getNextZIndex } from '../../utils/zIndex';
import { modalManager } from './Modal.manager';
import { useFocusTrap } from '../../hooks';
import { mergeRefs } from '../../utils/mergeRefs';
import { sharedTransitionProps, SharedTransitionProps, Transition } from '../Transition';
import { splitProps } from '../../utils/splitProps';
import { resolveResponsive, useBreakpoint, Responsive } from '../../utils/responsive';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

const modalDensities = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

type ModalDensity = (typeof modalDensities)[number];

type ModalMode = 'normal' | 'full' | 'fullscreen';

const modalSideSpaces = ['xs', 'sm', 'md', 'none'] as const;
type ModalSideSpace = (typeof modalSideSpaces)[number];

const modalWidthPresets = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
type ModalWidthPreset = (typeof modalWidthPresets)[number];
const modalWidthPresetSet = new Set<ModalWidthPreset>(modalWidthPresets);

// const modalSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full', 'fullscreen'] as const;
// type ModalSize = (typeof modalSizes)[number];

const modalOverlayStyles = ['blur', 'dim', 'none'] as const;
type ModalOverlayStyle = (typeof modalOverlayStyles)[number];

type OwnModalProps = {
    // size?: ModalSize;
    placement?: 'top' | 'center';
    separated?: boolean;
    opened?: boolean;
    onClose?: () => void;
    closeOnOverlayClick?: boolean;
    zIndex?: number;

    closeOnEscape?: boolean;
    initialFocus?: React.RefObject<HTMLElement>;
    portalContainer?: HTMLElement;
    overlayStyle?: ModalOverlayStyle;

    width?: BoxProps['width'] | Responsive<ModalWidthPreset>;
    w?: BoxProps['w'] | Responsive<ModalWidthPreset>;
    maxW?: BoxProps['maxW'] | Responsive<ModalWidthPreset>;
    maxWidth?: BoxProps['maxWidth'] | Responsive<ModalWidthPreset>;

    sideSpace?: Responsive<ModalSideSpace>;
    mode?: Responsive<ModalMode>;
    density?: Responsive<ModalDensity>;
};

type BoxModalProps = Pick<
    BoxProps,
    | 'height'
    | 'h'
    | 'maxHeight'
    | 'maxH'
    | 'shadow'
    | 'marginTop'
    | 'marginBottom'
    | 'mt'
    | 'mb'
    | 'rounded'
>;

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

const isModalWidthPreset = (value: unknown): value is ModalWidthPreset => {
    return typeof value === 'string' && modalWidthPresetSet.has(value as ModalWidthPreset);
};

const resolveModalWidthPreset = (value: string | number | undefined) => {
    return isModalWidthPreset(value) ? modalWidthPresetMap[value] : value;
};

//----------------------------------------------------------------------
// Maps
//----------------------------------------------------------------------

const modalWidthPresetMap: Record<ModalWidthPreset, string> = {
    '2xs': '22.5rem', // 360px
    xs: '30rem', // 480px
    sm: '40rem', // 640px
    md: '48rem', // 768px
    lg: '64rem', // 1024px
    xl: '80rem', // 1280px
    '2xl': '96rem', // 1536px

    full: '100%',
} as const;

const fullModeProps = {
    height: '100%',
    h: '100%',
    width: '100%',
    w: '100%',
    maxHeight: '100%',
    maxH: '100%',
    maxWidth: '100%',
    maxW: '100%',
    marginTop: 0,
    marginBottom: 0,
    mt: 0,
    mb: 0,
} as const;

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
            overlayStyle = 'dim',

            // Animation props
            animation = 'scale-fade',
            respectAttentionDuration = true,
            enterDuration: animationEnterDuration = 200,
            exitDuration: animationExitDuration = 150,
            enterEasing: enterAnimationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
            exitEasing: exitAnimationEasing = 'cubic-bezier(0.4, 0, 1, 1)',
            onEntered: onAnimationEntered,

            // Box props
            width,
            w,
            maxWidth,
            maxW,
            shadow = 'xl',
            rounded = 'xl',

            sideSpace = { base: 'xs', md: 'sm', xl: 'md' },
            mode = 'normal',
            density = 'md',

            ...rest
        },
        forwardedRef,
    ) => {
        const { breakpoint } = useBreakpoint();

        const [fullyVisible, setFullyVisible] = useState(false);
        const [hasHeader, setHasHeader] = useState(false);
        const [hasBody, setHasBody] = useState(false);

        const [transitionProps, restWithoutTransitionProps] = splitProps(
            rest,
            sharedTransitionProps,
        );

        const resolvedWidth = resolveResponsive(width || w, breakpoint);
        const resolvedMaxWidth = resolveResponsive(maxWidth || maxW, breakpoint);
        const resolvedSideSpace = resolveResponsive(sideSpace, breakpoint);
        const resolvedMode = resolveResponsive(mode, breakpoint);
        const resolvedDensity = resolveResponsive(density, breakpoint);

        const isFullMode = resolvedMode === 'full';
        const isFullscreenMode = resolvedMode === 'fullscreen';

        const finalWidth = resolveModalWidthPreset(resolvedWidth || '100%');
        const finalMaxWidth = resolveModalWidthPreset(resolvedMaxWidth || 'md');
        const finalSideSpace = isFullscreenMode ? 'none' : resolvedSideSpace;

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

        const sizingProps =
            isFullMode || isFullscreenMode
                ? fullModeProps
                : {
                      w: finalWidth,
                      maxW: finalMaxWidth,
                  };

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
                    data-side-space={finalSideSpace}
                    data-density={resolvedDensity}
                >
                    <Transition
                        visible={opened}
                        animation="fade"
                        enterDuration={animationEnterDuration}
                        exitDuration={animationExitDuration}
                        enterEasing={enterAnimationEasing}
                        exitEasing={exitAnimationEasing}
                        className={prefix('__overlay')}
                        data-style={overlayStyle}
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
                            {...restWithoutTransitionProps}
                            as={Box}
                            visible={opened}
                            animation={animation}
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
                            shadow={shadow}
                            rounded={isFullscreenMode ? undefined : rounded}
                            tabIndex={-1}
                            className={clsx(prefix('__content'), className)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={hasHeader ? headerId : undefined}
                            aria-describedby={hasBody ? bodyId : undefined}
                            {...sizingProps}
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

type ModalHeaderProps = {
    closeButton?: boolean;
} & DerivedProps &
    HTMLAttributes<HTMLDivElement>;

const ModalHeader = ({ children, className, closeButton = false, ...rest }: ModalHeaderProps) => {
    const ctx = useModalContext();

    useEffect(() => {
        ctx?.setHasHeader(true);

        return () => {
            ctx?.setHasHeader(false);
        };
    }, [ctx]);

    return (
        <BoxDerived {...rest} id={ctx?.headerId} className={clsx(prefix('__header'), className)}>
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
        </BoxDerived>
    );
};

ModalHeader.displayName = 'ModalHeader';

//----------------------------------------------------------------------
// ModalBody subcomponent
//----------------------------------------------------------------------

type ModalBodyProps = DerivedProps & HTMLAttributes<HTMLDivElement>;

const ModalBody = ({ children, className, ...rest }: ModalBodyProps) => {
    const ctx = useModalContext();

    useEffect(() => {
        ctx?.setHasBody(true);

        return () => {
            ctx?.setHasBody(false);
        };
    }, [ctx]);

    return (
        <BoxDerived {...rest} id={ctx?.bodyId} className={clsx(prefix('__body'), className)}>
            {children}
        </BoxDerived>
    );
};

ModalBody.displayName = 'ModalBody';

//----------------------------------------------------------------------
// ModalFooter subcomponent
//----------------------------------------------------------------------

type ModalFooterProps = DerivedProps & HTMLAttributes<HTMLDivElement>;

const ModalFooter = ({ children, className, ...rest }: ModalFooterProps) => {
    return (
        <BoxDerived {...rest} className={clsx(prefix('__footer'), className)}>
            {children}
        </BoxDerived>
    );
};

ModalFooter.displayName = 'ModalFooter';

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

//----------------------------------------------------------------------
// Exports
//----------------------------------------------------------------------

export { Modal };

export type {
    ModalSize,
    OwnModalProps,
    ModalProps,
    ModalComponent,
    ModalDensity,
    ModalMode,
    ModalSideSpace,
    ModalWidthPreset,
};

export { modalSizes };
