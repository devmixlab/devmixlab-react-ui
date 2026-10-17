import type { HTMLAttributes } from 'react';
import { Box } from '../Box';

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className = '', ...props }: TableBodyProps) {
  return <Box as="tbody" className={className} {...props} />;
}
