import {
    Modal,
    ModalComponent,
    ModalDensity,
    ModalMode,
    ModalProps,
    ModalSideSpace,
    ModalWidthPreset,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '../Modal';
import React, { ForwardedRef, forwardRef } from 'react';
import { BoxProps } from '../Box';
import { Responsive } from '../../utils/responsive';
import { classPrefix } from '../../utils/classPrefix';

//----------------------------------------------------------------------
// Types
//----------------------------------------------------------------------

export const offcanvasSizes = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type OffcanvasSize = (typeof offcanvasSizes)[number];

type OffcanvasPlacement = 'left' | 'right' | 'top' | 'bottom';

type OffcanvasAnimation = 'scale' | 'slide';

// type OffcanvasMode = 'normal' | 'fullscreen';

type OwnOffcanvasProps = {
    placement?: OffcanvasPlacement;
    animation?: OffcanvasAnimation;
    size?: OffcanvasSize;

    // width?: BoxProps['width'] | Responsive<ModalWidthPreset>;
    // w?: BoxProps['w'] | Responsive<ModalWidthPreset>;
    // maxW?: BoxProps['maxW'] | Responsive<ModalWidthPreset>;
    // maxWidth?: BoxProps['maxWidth'] | Responsive<ModalWidthPreset>;
};

type OffcanvasProps = OwnOffcanvasProps &
    Omit<ModalProps, 'animation' | 'attention' | 'placement' | 'size'>;

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
            animation: animationProp = 'slide',
            placement = 'left',
            rounded = 'none',
            sideSpace = 'none',
            ...rest
        },
        ref: ForwardedRef<HTMLDivElement>,
    ) => {
        const animation = `offcanvas-${animationProp}`;
        const isVertical = placement === 'top' || placement === 'bottom';

        return (
            <Modal
                {...rest}
                className={prefix()}
                placement={placement}
                animation={animation}
                rounded={rounded}
                sideSpace={sideSpace}
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
