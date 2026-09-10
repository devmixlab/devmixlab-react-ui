import React, { forwardRef, useRef, useState, useEffect, useMemo } from 'react';
import { TextInput, type TextInputProps } from '../TextInput';
import { useFormFieldContext } from '../FormField/FormField.context';
import { Search as SearchIcon } from '../../Icon/Search';
import { mergeRefs } from '../../../utils';
import { DefaultSpinner } from '../../Spinner/DefaultSpinner';
import { Dropdown } from '../Dropdown';
import { Text } from '../../Text';

type ComboboxOption<T = string> = {
  value: T;
  label: string;
};

type ComboboxProps<T = string> = Omit<TextInputProps, 'type'> & {
  options?: ComboboxOption<T>[];

  searchable?: boolean;

  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;

  onSearch?: (value: string) => void;
  debounce?: number;

  loading?: boolean;
  loadingIcon?: React.ReactNode;

  onOptionSelect?: (option: ComboboxOption<T>) => void;
  renderOption?: (option: ComboboxOption<T>) => React.ReactNode;

  emptyState?: React.ReactNode;

  sortOptions?: (options: ComboboxOption<T>[], query: string) => ComboboxOption<T>[];

  minChars?: number;
  showInfo?: boolean;
};

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options,
      searchable = true,

      onOptionSelect,
      renderOption,
      emptyState,

      sortOptions,
      minChars = 2,
      showInfo = true,

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
    const [opened, setOpened] = useState(false);
    const ctx = useFormFieldContext();

    const searchRef = useRef<HTMLInputElement>(null);
    const combinedRef = mergeRefs(searchRef, ref);

    const inputId = idProp ?? ctx?.id;

    // const finalSearchIcon = loading
    //     ? (loadingIcon ?? <DefaultSpinner />)
    //     : (searchIcon ?? <SearchIcon />);

    const finalLoadingSpinner = loadingIcon ?? <DefaultSpinner />;
    const finalSearchIcon = searchIcon ?? <SearchIcon />;

    const isControlled = props.value !== undefined;
    const [innerValue, setInnerValue] = useState('');

    const value = isControlled ? (props.value as string) : innerValue;
    const latestValueRef = useRef(value);

    const setValue = (v: string) => {
      latestValueRef.current = v;

      if (!isControlled) {
        setInnerValue(v);
      }

      props.onValueChange?.(v);
    };

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // const filteredOptions = useMemo(() => {
    //   const query = value.trim().toLowerCase();
    //
    //   if (query.length < minChars) {
    //     return [];
    //   }
    //
    //   const filtered = (options ?? []).filter((option) => {
    //     return (
    //       option.label.toLowerCase().includes(query) ||
    //       String(option.value).toLowerCase().includes(query)
    //     );
    //   });
    //
    //   return sortOptions ? sortOptions(filtered, query) : filtered;
    // }, [options, value, sortOptions]);

    const filteredOptions = useMemo(() => {
      if (!searchable) {
        return options ?? [];
      }

      const query = value.trim().toLowerCase();

      if (query.length < minChars) {
        return [];
      }

      const filtered = (options ?? []).filter((option) => {
        return (
          option.label.toLowerCase().includes(query) ||
          String(option.value).toLowerCase().includes(query)
        );
      });

      return sortOptions ? sortOptions(filtered, query) : filtered;
    }, [options, value, sortOptions, searchable, minChars]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const handleValueChange = (v: string) => {
      setOpened(true);
      setValue(v);

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

    const hasSingleExactMatch =
      filteredOptions.length === 1 &&
      filteredOptions[0].label.toLowerCase() === value.toLowerCase();

    // const isOpened =
    //   opened &&
    //   value.trim().length >= minChars &&
    //   filteredOptions.length > 0 &&
    //   !hasSingleExactMatch;

    const isOpened =
      opened &&
      (!searchable || value.trim().length >= minChars) &&
      filteredOptions.length > 0 &&
      !hasSingleExactMatch;

    return (
      <Dropdown
        shouldUnregister
        closeOnEscape
        autoFocusOption={false}
        open={isOpened}
        onOpenChange={setOpened}
        onValueChange={(v) => {
          setOpened(false);
          setValue(v);
          onSearch?.(v);
        }}
        invokeOnly
        returnFocusOnOptionPick
        // visibleOptions={4}
        typeahead={false}
      >
        <Dropdown.Trigger
          render={({ ref, content }) => {
            const { focusFirst } = content.focusableList;

            return (
              <TextInput
                {...props}
                clearable={!loading && clearable}
                clearIcon={clearIcon}
                id={inputId}
                ref={mergeRefs(ref, combinedRef)}
                type={'search'}
                start={finalSearchIcon}
                end={(loading && finalLoadingSpinner) || undefined}
                value={value}
                onValueChange={handleValueChange}
                // onKeyDown={handleKeyDown}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setOpened(false);
                  }

                  if (e.key === 'Enter' && !loading) {
                    if (debounce && timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                      timeoutRef.current = null;
                    }
                    onSearch?.(latestValueRef.current);
                  }

                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    if (!opened) {
                      setOpened(true);
                    } else {
                      focusFirst(true);
                    }
                  }

                  props.onKeyDown?.(e);
                }}
              />
            );
          }}
        />
        <Dropdown.Content>
          {showInfo && (
            <Text px={3} variant="body-sm" emphasis="muted">
              {filteredOptions.length} of {options?.length ?? 0}
            </Text>
          )}
          <Dropdown.List
            key={filteredOptions.map((o) => String(o.value)).join('|')}

            //   key={
            //   value.trim().length >= minChars
            //     ? filteredOptions.map((o) => o.value).join('|')
            //     : undefined
            // }
            // maxHeight={200}
          >
            {filteredOptions.map((option) => (
              <Dropdown.Option
                onKeyDown={(e) => {
                  const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

                  if (isPrintable) {
                    e.preventDefault();
                    searchRef.current?.focus();
                    handleValueChange(e.key);
                    return;
                  }
                }}
                value={String(option.label)}
                key={String(option.value)}
              >
                {option.label}
              </Dropdown.Option>
              // <button
              //   key={String(option.value)}
              //   type="button"
              //   onClick={() => {
              //     props.onValueChange?.(option.label);
              //     onOptionSelect?.(option);
              //   }}
              // >
              //   {renderOption ? renderOption(option) : option.label}
              // </button>
            ))}
          </Dropdown.List>
        </Dropdown.Content>
      </Dropdown>
    );
  },
);

Combobox.displayName = 'Combobox';

export { Combobox };

export type { ComboboxProps, ComboboxOption };
