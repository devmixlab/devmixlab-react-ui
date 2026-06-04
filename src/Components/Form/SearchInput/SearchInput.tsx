import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { TextInput, type TextInputProps } from '../TextInput/TextInput';
import { useFormFieldContext } from '../FormField/FormField.context';
import { Search as SearchIcon } from '../../../Icon/Search';
import { mergeRefs } from '../../../utils/mergeRefs';
import { DefaultSpinner } from '../../../Spinner/DefaultSpinner';

export type SearchInputProps = Omit<TextInputProps, 'type'> & {
    searchIcon?: React.ReactNode;
    clearIcon?: React.ReactNode;

    onSearch?: (value: string) => void;
    debounce?: number; // ms

    loading?: boolean;
    loadingIcon?: React.ReactNode;
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            searchIcon,
            clearIcon,
            onSearch,
            debounce = 300,
            loading = false,
            loadingIcon,
            clearable,
            id: idProp,
            ...props
        },
        ref,
    ) => {
        const ctx = useFormFieldContext();

        const searchRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(searchRef, ref);

        const inputId = idProp ?? ctx?.id;

        const finalSearchIcon = loading
            ? (loadingIcon ?? <DefaultSpinner />)
            : (searchIcon ?? <SearchIcon />);

        const isControlled = props.value !== undefined;
        const [innerValue, setInnerValue] = useState('');

        const value = isControlled ? (props.value as string) : innerValue;
        const latestValueRef = useRef(value);

        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        useEffect(() => {
            latestValueRef.current = value;
        }, [value]);

        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        const handleValueChange = (v: string) => {
            latestValueRef.current = v;

            if (!isControlled) {
                setInnerValue(v);
            }

            props.onValueChange?.(v);

            if (!onSearch) return;

            // immediate mode
            if (!debounce) {
                onSearch(v);
                return;
            }

            // debounce mode
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                onSearch(latestValueRef.current); // always latest value
            }, debounce);
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !loading) {
                if (debounce && timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                onSearch?.(latestValueRef.current);
            }

            props.onKeyDown?.(e);
        };

        return (
            <TextInput
                {...props}
                clearable={clearable}
                clearIcon={clearIcon}
                id={inputId}
                ref={combinedRef}
                type={'search'}
                start={finalSearchIcon}
                onValueChange={handleValueChange}
                onKeyDown={handleKeyDown}
            />
        );
    },
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
