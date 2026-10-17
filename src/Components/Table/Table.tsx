import type { TableHTMLAttributes } from 'react';
import { Box } from '../Box';

type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table({ className = '', ...props }: TableProps) {
  return (
    <Box w="full" overflowX="auto">
      <Box
        as="table"
        w="full"
        textAlign="left"
        borderCollapse="collapse"
        className={className}
        {...props}
      />
    </Box>
  );
}
