import type { HTMLAttributes } from 'react';
import { Box } from '../Box';
import { useTableContext } from './contexts';

type TableHeadProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHead({ className = '', children, ...props }: TableHeadProps) {
  const { spacingHeader } = useTableContext();

  return (
    <Box as="thead" className={className} {...props}>
      {children}

      {spacingHeader > 0 && (
        <Box as="tr" aria-hidden="true">
          <Box
            as="th"
            colSpan={100}
            p={0}
            h={spacingHeader}
          />
        </Box>
      )}
    </Box>
  );
}
