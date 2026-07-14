import React from 'react';
import clsx from 'clsx';
import { classPrefix } from '../../utils/classPrefix';

export const orientations = ['horizontal', 'vertical'] as const;
export type Orientation = (typeof orientations)[number];

export type DividerProps = {
  orientation?: Orientation;
  decorative?: boolean;
  className?: string;
};

const prefix = (name = '') => classPrefix(`--divider${name}`);

function Divider({ orientation = 'horizontal', decorative = false, className }: DividerProps) {
  return (
    <div
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
