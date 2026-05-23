import { useRef, useCallback } from 'react';

type TypeaheadItem = {
    id: string;
    label?: string;
    value: string;
    disabled?: boolean;
};

export function useTypeahead(onMatch: (id: string) => void, getItems: () => TypeaheadItem[]) {
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

                return (opt.label ?? opt.value).toLowerCase().trimStart().startsWith(query);
            });

            if (match) {
                onMatch(match.id);
            }
        },
        [onMatch, getItems],
    );
}

// import { useRef, useCallback } from 'react';
//
// type TypeaheadItem = {
//     label?: string;
//     value: string;
//     disabled?: boolean;
// };
//
// export function useTypeahead(onMatch: (index: number) => void, getItems: () => TypeaheadItem[]) {
//     const bufferRef = useRef('');
//     const timestampRef = useRef(0);
//
//     return useCallback(
//         (key: string) => {
//             const now = Date.now();
//
//             if (now - timestampRef.current > 500) {
//                 bufferRef.current = '';
//             }
//
//             timestampRef.current = now;
//             bufferRef.current += key.toLowerCase();
//
//             const query = bufferRef.current;
//
//             const index = getItems().findIndex((opt) => {
//                 if (opt.disabled) return false;
//                 return (opt.label ?? opt.value).toLowerCase().trimStart().startsWith(query);
//             });
//
//             if (index !== -1) onMatch(index);
//         },
//         [onMatch, getItems],
//     );
// }
