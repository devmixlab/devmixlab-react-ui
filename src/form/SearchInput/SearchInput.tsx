import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Input, type InputProps } from '../Input/Input';
import { useFormFieldContext } from '../FormField/formField.context';
import { Search as SearchIcon } from '../../Icon/Search';
import { mergeRefs } from '../../utils/mergeRefs';
import { DefaultSpinner } from '../../Spinner/DefaultSpinner';

export type SearchInputProps = Omit<InputProps, 'type'> & {
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

        // handle typing (immediate)
        const handleValueChange = (v: string) => {
            if (!isControlled) {
                setInnerValue(v);
            }

            if (!debounce) {
                onSearch?.(v);
            }

            props.onValueChange?.(v); // preserve original behavior
        };

        const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        useEffect(() => {
            if (!onSearch || !debounce || value === '' || loading) return;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                onSearch?.(value);
            }, debounce);

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            };
        }, [value, debounce, onSearch, loading]);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !loading) {
                if (debounce && timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                onSearch?.(value);
            }

            props.onKeyDown?.(e);
        };

        return (
            <Input
                {...props}
                clearable={!loading && clearable}
                clearIcon={clearIcon}
                id={inputId}
                ref={combinedRef}
                type={'text'}
                start={finalSearchIcon}
                onValueChange={handleValueChange}
                onKeyDown={handleKeyDown}
            />
        );
    },
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
