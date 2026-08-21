import { useRef, useCallback } from 'react';

type TypeaheadItem<T extends string | number = string> = {
  id: string;
  label?: string;
  value: T | null;
  disabled?: boolean;
};

export function useTypeahead<T extends string | number = string>(
  onMatch: (id: string) => void,
  getItems: () => TypeaheadItem<T>[],
) {
  const bufferRef = useRef('');
  const timestampRef = useRef(0);

  return useCallback(
    (key: string) => {
      const now = Date.now();

      if (now - timestampRef.current > 500) {
        bufferRef.current = '';
      }

      timestampRef.current = now;

      bufferRef.current += key.toLowerCase();

      const query = bufferRef.current;

      const match = getItems().find((opt) => {
        if (opt.disabled) {
          return false;
        }

        return String(opt.label ?? opt.value ?? '')
          .toLowerCase()
          .trimStart()
          .startsWith(query);
      });

      if (match) {
        onMatch(match.id);
      }
    },
    [onMatch, getItems],
  );
}
