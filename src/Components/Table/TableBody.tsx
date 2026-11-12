import type { HTMLAttributes } from 'react';
import { Box } from '../Box';
import { useTableContext } from './contexts';

type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableBody({ className = '', children, ...props }: TableBodyProps) {
  const { spacingBody } = useTableContext();

  return (
    <Box as="tbody" className={className} {...props}>
      {spacingBody > 0 && (
        <Box as="tr" aria-hidden="true">
          <Box as="td" colSpan={100} p={0} h={spacingBody} />
        </Box>
      )}

      {children}
    </Box>
  );
}
