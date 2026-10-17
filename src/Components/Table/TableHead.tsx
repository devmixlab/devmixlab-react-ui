import type { HTMLAttributes } from 'react';
import { Box } from '../Box';

type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHead({ className = '', ...props }: TableHeadProps) {
  return <Box as="thead" className={className} {...props} />;
}
