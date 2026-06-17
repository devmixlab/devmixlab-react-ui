import { Modal, ModalProps, ModalHeader, ModalBody, ModalFooter } from '../Modal';
import React, { ForwardedRef, forwardRef } from 'react';
import { resolveResponsive, Responsive, useBreakpoint } from '../../utils/responsive';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

export const offcanvasSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;
export type OffcanvasSize = (typeof offcanvasSizes)[number];

export const offcanvasHeights: Record<OffcanvasSize, string> = {
    '2xs': '10vh',
    xs: '15vh',
    sm: '25vh',
    md: '35vh',
    lg: '50vh',
    xl: '65vh',
    '2xl': '80vh',
    full: '100%',
};

export const offcanvasWidths: Record<OffcanvasSize, string> = {
    '2xs': '280px',
    xs: '320px',
    sm: '400px',
    md: '480px',
    lg: '640px',
    xl: '800px',
    '2xl': '960px',
    full: '100%',
};

type OffcanvasPlacement = 'left' | 'right' | 'top' | 'bottom';

type OffcanvasAnimation = 'slide';

// type OffcanvasMode = 'normal' | 'fullscreen';

type OwnOffcanvasProps = {
    placement?: OffcanvasPlacement;
    animation?: OffcanvasAnimation;
    size?: Responsive<OffcanvasSize>;
};

type OffcanvasProps = OwnOffcanvasProps & Omit<ModalProps, 'animation' | 'placement' | 'size'>;

type OffcanvasComponent = React.ForwardRefExoticComponent<
    OffcanvasProps & React.RefAttributes<HTMLDivElement>
> & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

//----------------------------------------------------------------------
// Helpers
//----------------------------------------------------------------------

const prefix = (name: string = '') => classPrefix(`--offcanvas${name}`);

const Offcanvas = forwardRef<HTMLDivElement, OffcanvasProps>(
    (
        {
            className,

            animation: animationProp = 'slide',
            placement = 'left',
            rounded = 'none',
            sideSpace = 'none',

            size: sizeProp,

            w: wProp,
            width: widthProp,
            maxW: maxWProp,
            maxWidth: maxWidthProp,
            h: hProp,
            height: heightProp,
            maxH: maxHProp,
            maxHeight: maxHeightProp,

            // Props offcanvas do not need
            attention,

            ...rest
        },
        ref: ForwardedRef<HTMLDivElement>,
    ) => {
        const { breakpoint } = useBreakpoint();

        const size = resolveResponsive(sizeProp, breakpoint) ?? 'md';
        const hasExplicitSize = sizeProp !== undefined;

        const animation = `offcanvas-${animationProp}`;
        const isVertical = placement === 'top' || placement === 'bottom';

        const dimensions: Record<string, string | number> = {};

        if (isVertical) {
            const resolvedHeightProp = resolveResponsive(hProp ?? heightProp, breakpoint);
            const resolvedMaxHeightProp = resolveResponsive(maxHProp ?? maxHeightProp, breakpoint);

            dimensions.height = resolvedHeightProp ?? (hasExplicitSize ? '100%' : 'auto');
            dimensions.maxHeight = resolvedMaxHeightProp ?? offcanvasHeights[size];

            dimensions.width = '100%';
            dimensions.maxWidth = '100%';
        } else {
            const resolvedWidthProp = resolveResponsive(wProp ?? widthProp, breakpoint);
            const resolvedMaxWidthProp = resolveResponsive(maxWProp ?? maxWidthProp, breakpoint);

            dimensions.width = resolvedWidthProp ?? '100%';
            dimensions.maxWidth = resolvedMaxWidthProp ?? offcanvasWidths[size];

            dimensions.height = '100%';
        }

        return (
            <Modal
                {...rest}
                {...dimensions}
                className={clsx(prefix(), className)}
                placement={placement}
                animation={animation}
                rounded={rounded}
                sideSpace={sideSpace}
                enterDuration={250}
                exitDuration={180}
                enterEasing="cubic-bezier(0.22, 1, 0.36, 1)"
                exitEasing="cubic-bezier(0.4, 0, 1, 1)"
                ref={ref}
            ></Modal>
        );
    },
) as OffcanvasComponent;

Offcanvas.displayName = 'Offcanvas';

Offcanvas.Header = ModalHeader;
Offcanvas.Body = ModalBody;
Offcanvas.Footer = ModalFooter;

export { Offcanvas };
