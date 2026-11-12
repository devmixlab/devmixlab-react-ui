import type { TableHTMLAttributes } from 'react';
import { Box } from '../Box';
import { TableContext } from './contexts';

//--------------------------------
// Types
//--------------------------------

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  spacingHeader?: number;
  spacingBody?: number;
};

//--------------------------------
// Table component
//--------------------------------

export function Table({
  className = '',
  spacingHeader = 0,
  spacingBody = 0,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ spacingHeader, spacingBody }}>
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
    </TableContext.Provider>
  );
}
