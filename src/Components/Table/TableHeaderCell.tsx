import type { ThHTMLAttributes } from 'react';
import { Box } from '../Box';

type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement>;

export function TableHeaderCell({ className = '', ...props }: TableHeaderCellProps) {
  return <Box as="th" className={className} {...props} />;
}
