import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { TextInput, type TextInputProps } from '../TextInput';
import { useFormFieldContext } from '../FormField/FormField.context';
import { Search as SearchIcon } from '../../Icon/Search';
import { mergeRefs } from '../../../utils';
import { DefaultSpinner } from '../../Spinner/DefaultSpinner';
import { Popover } from '../../Popover';
import { Dropdown } from '../Dropdown';

type ComboboxOption<T = string> = {
  value: T;
  label: string;
};

// type ComboboxProps = Omit<TextInputProps, 'type'> & {
//   searchIcon?: React.ReactNode;
//   clearIcon?: React.ReactNode;
//
//   onSearch?: (value: string) => void;
//   debounce?: number; // ms
//
//   loading?: boolean;
//   loadingIcon?: React.ReactNode;
// };

type ComboboxProps<T = string> = Omit<TextInputProps, 'type'> & {
  options?: ComboboxOption<T>[];

  searchIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;

  onSearch?: (value: string) => void;
  debounce?: number;

  loading?: boolean;
  loadingIcon?: React.ReactNode;

  onOptionSelect?: (option: ComboboxOption<T>) => void;
  renderOption?: (option: ComboboxOption<T>) => React.ReactNode;

  emptyState?: React.ReactNode;
};

const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options,
      onOptionSelect,
      renderOption,
      emptyState,

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
    const [opened, setOpened] = useState(true);
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

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const filteredOptions = (options ?? []).filter((option) => {
      const query = value.toLowerCase();

      return (
        option.label.toLowerCase().includes(query) ||
        String(option.value).toLowerCase().includes(query)
      );
    });

    useEffect(() => {
      latestValueRef.current = value;
      if (!opened) setOpened(true);
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

    const isOpened = opened && filteredOptions.length > 0 && value.length > 0;

    // console.log('value', value);
    // console.log(23423423);

    return (
      <Dropdown autoFocusOption={false} open={isOpened}>
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
                    focusFirst(true);
                    // requestAnimationFrame(() => {
                    //   focusFirst();
                    // });
                  }

                  props.onKeyDown?.(e);
                }}
              />
            );
          }}
        />
        <Dropdown.Content>
          <Dropdown.List>
            {filteredOptions.map((option) => (
              <Dropdown.Option value={option.value} key={String(option.value)}>
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

export type { ComboboxProps };
