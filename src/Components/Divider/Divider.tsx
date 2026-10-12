import React, { ComponentProps } from 'react';
import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';
import { Box, BoxProps } from '../Box';

export const orientations = ['horizontal', 'vertical'] as const;
export type Orientation = (typeof orientations)[number];

export type DividerProps = {
  orientation?: Orientation;
  decorative?: boolean;
  // className?: string;
} & BoxProps &
  ComponentProps<'div'>;

const prefix = (name = '') => classPrefix(`--divider${name}`);

function Divider({
  orientation = 'horizontal',
  decorative = false,
  className,
  ...rest
}: DividerProps) {
  return (
    <Box
      {...rest}
      role={decorative ? undefined : 'separator'}
      aria-orientation={orientation}
      aria-hidden={decorative || undefined}
      className={clsx(prefix(), className)}
      data-orientation={orientation}
    />
  );
}

Divider.displayName = 'Divider';

export { Divider };
