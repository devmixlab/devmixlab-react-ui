import React from 'react';
import { Icon } from './Icon';

export const Dot = ({ ...props }: React.ComponentProps<typeof Icon>) => {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
};
