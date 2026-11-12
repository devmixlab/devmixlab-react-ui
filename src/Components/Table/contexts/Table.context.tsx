import { createContext, useContext } from 'react';

//------------------------
// Context
//------------------------

interface TableContextValue {
  spacingHeader: number;
  spacingBody: number;
}

export const TableContext = createContext<TableContextValue>({
  spacingHeader: 0,
  spacingBody: 0,
});

//------------------------
// Hook
//------------------------

export const useTableContext = () => useContext(TableContext);
