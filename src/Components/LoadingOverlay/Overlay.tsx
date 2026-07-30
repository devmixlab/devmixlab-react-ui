import { Transition, TransitionProps } from '../Transition';
import { DefaultSpinner } from '../Spinner/DefaultSpinner';
import { ComponentProps, ReactNode } from 'react';
import { classPrefix } from '../../utils/classPrefix';
import { clsx } from 'clsx';
import { BoxProps } from '../Box';

//------------------------------------------------------------
// Types
//------------------------------------------------------------

type OwnOverlayProps = {
  // opened: boolean;
  spinner?: ReactNode;
  children?: ReactNode;
};

type OverlayProps = OwnOverlayProps & TransitionProps & BoxProps & ComponentProps<'div'>;

//------------------------------------------------------------
// Helpers
//------------------------------------------------------------

const prefix = (name: string = '') => {
  return classPrefix(`--loading-overlay${name}`);
};

//------------------------------------------------------------
// LoadingOverlay
//------------------------------------------------------------

const Overlay = ({
  className,
  spinner,
  children,
  zIndex = 100,
  gap = '12px',
  ...rest
}: OverlayProps) => {
  return (
    <Transition
      {...rest}
      className={clsx(prefix(), className)}
      animation="fade"
      enterDuration={0}
      exitDuration={250}
      zIndex={zIndex}
      gap={gap}
    >
      {spinner ?? <DefaultSpinner />}
      {children}
    </Transition>
  );
};

//------------------------------------------------------------
// Exports
//------------------------------------------------------------

export { Overlay };

export type { OwnOverlayProps, OverlayProps };
