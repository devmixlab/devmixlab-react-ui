import React from 'react';
import { Icon } from './Icon';

export const ChevronRight = (props: React.ComponentProps<typeof Icon>) => {
  return (
    <Icon
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </Icon>
  );
};
