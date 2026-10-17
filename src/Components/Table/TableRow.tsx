import type { HTMLAttributes } from 'react';
import { Box } from '../Box';

type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className = '', ...props }: TableRowProps) {
  return <Box as="tr" className={className} {...props} />;
}
