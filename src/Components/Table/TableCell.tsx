import type { TdHTMLAttributes } from 'react';
import { Box } from '../Box';

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement>;

export function TableCell({ className = '', ...props }: TableCellProps) {
  return <Box as="td" className={className} {...props} />;
}
