import React, { forwardRef, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Box, BoxProps } from '../../Box/Box';
import { useFormFieldContext } from '../FormField/formField.context';
import { classPrefix } from '../../utils/classPrefix';
import { useStableId } from '../../utils/useStableId';
import { SearchInput, SearchInputProps } from '../SearchInput/SearchInput';
import { Text } from '../../Text/Text';
import { useFocusableList, useTypeahead } from '../../hooks';
import {
    Popover,
    TriggerRenderProps,
    PopoverPanelProps,
    PopoverProps,
    PopoverTriggerProps,
} from '../../Popover';
import { clsx } from 'clsx';
import { DropdownContext, useDropdownContext, DropdownContextValue } from './Dropdown.context';
import { GroupContext, useGroupContext, GroupContextValue } from './Group.context';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OnReadyCallbackProps = {
    isSearchable: boolean;
    searchInputRef: React.RefObject<HTMLInputElement>;
};

export type DropdownRole = 'menu' | 'listbox';

export type DropdownOptionData = {
    id: string;
    value: string;
    label?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    ref?: HTMLElement | null;
    group?: GroupContextValue;
};

export type DropdownGroupData = {
    id: string;
    label?: string;
};

export type DropdownProps = {
    children?: React.ReactNode;
    className?: string;
    id?: string;

    // enables chevron on trigger
    chevron?: boolean;

    // sets how many visible options available till scroll will be applied
    visibleOptions?: number;

    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: React.ReactNode;
    invalid?: boolean;

    triggerRender?: (props: TriggerRenderProps) => React.ReactNode;
} & PopoverProps;

type DropdownComponent = React.ForwardRefExoticComponent<
    DropdownProps & React.RefAttributes<HTMLDivElement>
> & {
    Trigger: typeof DropdownTrigger;
    Content: typeof DropdownContent;
    Search: typeof DropdownSearch;
    List: typeof DropdownList;
    Group: typeof DropdownGroup;
    Label: typeof DropdownLabel;
    Option: typeof DropdownOption;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const prefix = (name: string = '') => classPrefix(`--dropdown${name}`);

// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
    (
        {
            children,
            className,
            id,

            chevron = true,
            onOpenChange,

            visibleOptions = 6,
            // placement = 'bottom-end',
            // offset,
            // type = 'button',
            value,
            defaultValue,
            onChange,
            placeholder = 'Select option',

            invalid = false,
            disabled = false,

            // rounded = 'md',
            // size = 'md',

            triggerRender,

            ...rest
        },
        ref,
    ) => {
        // const dropdownId = id ?? useStableId('dropdown');

        // ------------------------------------------------------------------
        // Open / search state
        // ------------------------------------------------------------------

        const [options, setOptions] = useState<DropdownOptionData[]>([]);
        const [opened, setOpened] = useState(false);
        const [isSearchable, setIsSearchable] = useState(false);
        const [search, setSearch] = useState('');

        const registerOption = useCallback((option: DropdownOptionData) => {
            setOptions((prev) => {
                const exists = prev.some((item) => item.id === option.id);

                if (exists) {
                    return prev.map((item) => (item.id === option.id ? option : item));
                }

                return [...prev, option];
            });
        }, []);

        const unregisterOption = useCallback((id: string) => {
            setOptions((prev) => prev.filter((option) => option.id !== id));
        }, []);

        // ------------------------------------------------------------------
        // Trigger press state
        // ------------------------------------------------------------------

        const [triggerFocusedVisible, setTriggerFocusedVisible] = useState(false);
        const [pressed, setPressed] = useState(false);
        const [optionPressed, setOptionPressed] = useState<number | null>(null);

        // ------------------------------------------------------------------
        // Value / selection
        // ------------------------------------------------------------------

        const isControlled = value !== undefined;
        const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
        const selectedValue = isControlled ? value : internalValue;

        // ------------------------------------------------------------------
        // Filter options -> filteredOptions
        // ------------------------------------------------------------------

        const filteredOptions = useMemo(() => {
            if (!search.trim()) return options;

            const normalized = search.toLowerCase().trim();
            return options.filter((option) =>
                (option.label ?? option.value).toLowerCase().trim().includes(normalized),
            );
        }, [options, search, isSearchable]);

        const selectedOption = useMemo(
            () => options.find((option) => option.value === selectedValue),
            [options, selectedValue],
        );

        const isOptionShown = (option: DropdownOptionData) => {
            const isInFiltered = filteredOptions.some((o) => o.id == option.id);
            return isInFiltered;
        };

        // ------------------------------------------------------------------
        // Focusable list (keyboard nav + focus tracking)
        // ------------------------------------------------------------------

        const focusableList = useFocusableList(filteredOptions);
        const {
            focusedId: optionFocused,
            // focusedVisibleId: optionFocusedVisible,
            // setFocusedId: setOptionFocused,
            // setFocusedVisibleId: setOptionFocusedVisible,
            setFocuses,
            // focusFirst,
            // focusLast,
            // focusNext,
            // setRef: setOptionRef,
            // firstFocusableId,
            // lastFocusableId,
            itemRefs: optionRefs,
        } = focusableList;

        useEffect(() => {
            if (optionFocused == null) return;
            optionRefs.current.get(optionFocused)?.scrollIntoView({ block: 'nearest' });
        }, [optionFocused]);

        // ------------------------------------------------------------------
        // Typeahead
        // ------------------------------------------------------------------

        const focusByTypeahead = useTypeahead(
            (id) => optionRefs.current.get(id)?.focus(),
            () => filteredOptions,
        );

        // ------------------------------------------------------------------
        // Refs
        // ------------------------------------------------------------------

        const readyCallbacksRef = useRef<Array<() => void>>([]);
        const searchInputRef = useRef<HTMLInputElement>(null);
        const triggerRef = useRef<HTMLElement>(null);

        // ------------------------------------------------------------------
        // Handlers
        // ------------------------------------------------------------------

        const runAfterReady = useCallback((callback: () => void) => {
            readyCallbacksRef.current.push(callback);
        }, []);

        const flushReadyCallbacks = useCallback(() => {
            const callbacks = readyCallbacksRef.current;

            readyCallbacksRef.current = [];

            callbacks.forEach((callback) => {
                callback();
            });
        }, []);

        const handleSelect = (nextValue: string) => {
            if (!isControlled) setInternalValue(nextValue);
            onChange?.(nextValue);
            setOpened(false);
            setFocuses(null);
        };

        // ------------------------------------------------------------------
        // Context
        // ------------------------------------------------------------------

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;

        const ctxValue = useMemo<DropdownContextValue>(
            () => ({
                opened,
                setOpened,
                triggerRef,
                handleSelect,
                focusByTypeahead,
                isOptionShown,
                disabled,
                invalid,
                optionPressed,
                setOptionPressed,
                isSearchable,
                setIsSearchable,
                search,
                setSearch,
                searchInputRef,
                focusableList,
                // else
                selectedOption,
                selectedValue,
                options,
                filteredOptions,
                registerOption,
                unregisterOption,
                runAfterReady,
            }),
            [
                opened,
                setOpened,
                triggerRef,
                handleSelect,
                focusByTypeahead,
                isOptionShown,
                disabled,
                invalid,
                optionPressed,
                setOptionPressed,
                isSearchable,
                setIsSearchable,
                search,
                setSearch,
                searchInputRef,
                focusableList,
                selectedOption,
                selectedValue,
                options,
                filteredOptions,
                registerOption,
                unregisterOption,
                runAfterReady,
            ],
        );

        // ------------------------------------------------------------------
        // Render
        // ------------------------------------------------------------------

        return (
            <DropdownContext.Provider value={ctxValue}>
                <Popover
                    open={opened}
                    onOpenChange={(state) => {
                        onOpenChange?.(state);
                        setOpened(state);
                    }}
                    {...rest}
                    onUnmount={() => {
                        if (search.length > 0) setSearch('');
                    }}
                    onReady={() => {
                        flushReadyCallbacks();
                    }}
                >
                    {children}
                </Popover>
            </DropdownContext.Provider>
        );
    },
) as DropdownComponent;

Dropdown.displayName = 'Dropdown';

// ---------------------------------------------------------------------------
// DropdownTrigger
// ---------------------------------------------------------------------------

type DropdownTriggerProps = {
    placeholder?: React.ReactNode;
} & PopoverTriggerProps;

const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(
    (
        { children, className, placeholder = 'Select option', chevron = false, render, ...rest },
        ref,
    ) => {
        const {
            options,
            selectedOption,
            isSearchable,
            focusableList,
            searchInputRef,
            setOpened,
            opened,
            runAfterReady,
            focusByTypeahead,
        } = useDropdownContext();

        const {
            setRef,
            setFocusedVisibleId,
            setFocusedId,
            focusedVisibleId,
            focusNext,
            focusFirst,
            focusLast,
            focusById,
            lastFocusableId,
            firstFocusableId,
            focusedId,
            setFocuses,
        } = focusableList;

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            const key = e.key;

            if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                focusByTypeahead(key);
                return;
            }

            if (key === 'ArrowUp') {
                e.preventDefault();
                if (!opened) {
                    setOpened(true);
                    return;
                }

                if (isSearchable) {
                    searchInputRef.current?.focus();
                } else {
                    focusLast();
                }
            } else if (key === 'ArrowDown') {
                e.preventDefault();
                if (!opened) {
                    setOpened(true);
                    return;
                }

                if (isSearchable) {
                    searchInputRef.current?.focus();
                } else {
                    focusFirst();
                }
            } else if (key === 'Enter' || key === ' ') {
                runAfterReady(() => {
                    if (opened) {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpened(false);
                        return;
                    }

                    if (searchInputRef.current) {
                        searchInputRef.current?.focus();
                    } else {
                        if (selectedOption) {
                            focusById(selectedOption.id);
                        } else {
                            focusFirst();
                        }
                    }
                });
            }
        };

        return render ? (
            <Popover.Trigger {...rest} onKeyDown={handleKeyDown} render={render} />
        ) : (
            <Popover.Trigger {...rest} onKeyDown={handleKeyDown} chevron={chevron}>
                {selectedOption?.children ?? (
                    <Box as="span" opacity={0.8}>
                        {placeholder}
                    </Box>
                )}
            </Popover.Trigger>
        );
    },
);

DropdownTrigger.displayName = 'DropdownTrigger';

Dropdown.Trigger = DropdownTrigger;

// ---------------------------------------------------------------------------
// DropdownContent
// ---------------------------------------------------------------------------

type DropdownContentProps = {} & PopoverPanelProps;

const DropdownContent = forwardRef<HTMLElement, DropdownContentProps>(
    ({ children, ...rest }, ref) => {
        return <Popover.Panel {...rest}>{children}</Popover.Panel>;
    },
);

DropdownContent.displayName = 'DropdownContent';

Dropdown.Content = DropdownContent;

// ---------------------------------------------------------------------------
// DropdownSearch
// ---------------------------------------------------------------------------

type DropdownSearchProps = {
    placeholder?: string;
} & SearchInputProps;

const DropdownSearch = forwardRef<HTMLElement, DropdownSearchProps>(
    ({ placeholder = 'Search...', ...rest }, ref) => {
        const {
            setIsSearchable,
            search,
            setSearch,
            searchInputRef,
            setOpened,
            setOptionPressed,
            focusableList,
            options,
            filteredOptions,
        } = useDropdownContext();

        useEffect(() => {
            setIsSearchable(true);

            return () => setIsSearchable(false);
        }, [setIsSearchable]);

        const { focusFirst, setFocuses, focusLast } = focusableList;

        return (
            <Box className={prefix('__search-wrapper')}>
                <SearchInput
                    {...rest}
                    ref={searchInputRef}
                    value={search}
                    onValueChange={setSearch}
                    // autoFocus
                    placeholder={placeholder}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            focusFirst();
                        } else if (e.key === 'Home') {
                            e.preventDefault();
                            focusFirst();
                        } else if (e.key === 'End') {
                            e.preventDefault();
                            focusLast();
                        } else if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpened(false);
                        }
                    }}
                />

                {search.trim() && (
                    <Text
                        className={prefix('__search-results')}
                        variant="body-sm"
                        emphasis="muted"
                        pt="sm"
                    >
                        Showing {filteredOptions.length} of {options.length}
                    </Text>
                )}

                {filteredOptions.length === 0 && (
                    <Text variant="body-sm" emphasis="muted" px="md" pb="sm" pt="md">
                        No results found
                    </Text>
                )}
            </Box>
        );
    },
);

DropdownSearch.displayName = 'DropdownSearch';

Dropdown.Search = DropdownSearch;

// ---------------------------------------------------------------------------
// DropdownList
// ---------------------------------------------------------------------------

type DropdownListProps = {
    children: React.ReactNode;
    className?: string;
} & BoxProps;

const DropdownList = forwardRef<HTMLDivElement, DropdownListProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__list'), className)} {...rest}>
                {children}
            </Box>
        );
    },
);

DropdownList.displayName = 'DropdownList';

Dropdown.List = DropdownList;

// ---------------------------------------------------------------------------
// DropdownGroup
// ---------------------------------------------------------------------------

type DropdownGroupProps = {
    children: React.ReactNode;
    className: string;
    label?: string;
} & BoxProps;

const DropdownGroup = forwardRef<HTMLDivElement, DropdownGroupProps>(
    ({ children, className, label, ...rest }, ref) => {
        // const ctx = useDropdownContext();

        const id = useStableId('-group');

        return (
            <GroupContext.Provider value={{ id, label }}>
                <Box ref={ref} className={clsx(prefix('__group'), className)} {...rest}>
                    {children}
                </Box>
            </GroupContext.Provider>
        );
    },
);

DropdownGroup.displayName = 'DropdownGroup';

Dropdown.Group = DropdownGroup;

// ---------------------------------------------------------------------------
// DropdownLabel
// ---------------------------------------------------------------------------

export type DropdownLabelProps = {
    children: React.ReactNode;
    className: string;
} & BoxProps;

const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
    ({ children, className, ...rest }, ref) => {
        return (
            <Box ref={ref} className={clsx(prefix('__group-label'), className)} {...rest}>
                {children}
            </Box>
        );
    },
);

DropdownLabel.displayName = 'DropdownLabel';

Dropdown.Label = DropdownLabel;

// ---------------------------------------------------------------------------
// DropdownOption
// ---------------------------------------------------------------------------

export type DropdownOptionProps = {
    id?: string;
    value: string;
    label?: string;
    disabled?: boolean;
    children: React.ReactNode;
    className: string;
} & BoxProps;

const DropdownOption = forwardRef<HTMLElement, DropdownOptionProps>(
    ({ id, value, label, disabled, children, className, ...rest }, ref) => {
        // const finalId = id ?? useStableId('dropdown-option');
        const optionId = value;

        const [pressed, setPressed] = useState<boolean>(false);

        const {
            registerOption,
            unregisterOption,
            disabled: ctxDisabled,
            selectedValue,
            focusableList,
            handleSelect,
            focusByTypeahead,
            isSearchable,
            searchInputRef,
            setOpened,
            isOptionShown,
            // triggerRef,
            options,
        } = useDropdownContext();

        const group = useGroupContext();

        const {
            setRef,
            setFocusedVisibleId,
            setFocusedId,
            focusedVisibleId,
            focusNext,
            focusFirst,
            focusLast,
            lastFocusableId,
            firstFocusableId,
            focusedId,
            setFocuses,
        } = focusableList;

        const selected = value === selectedValue;
        const finalDisabled = ctxDisabled || disabled;

        const option = {
            id: optionId,
            value,
            label,
            disabled: finalDisabled,
            children,
            group: group ?? undefined,
        };

        useEffect(() => {
            registerOption(option);

            // return () => unregisterOption(optionId);
        }, [optionId, value, label, finalDisabled, children, group]);

        const handleKeyDown = (e: React.KeyboardEvent) => {
            const key = e.key;

            if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                focusByTypeahead(key);
                return;
            }

            if (key === 'ArrowDown') {
                e.preventDefault();
                if (isSearchable && optionId === lastFocusableId) {
                    searchInputRef.current?.focus();
                    return;
                }
                focusNext();
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                if (isSearchable && optionId === firstFocusableId) {
                    searchInputRef.current?.focus();
                    return;
                }
                focusNext(-1);
            } else if (key === 'Home') {
                e.preventDefault();
                focusFirst();
            } else if (key === 'End') {
                e.preventDefault();
                focusLast();
            } else if (key === 'Enter' || key === ' ') {
                setPressed(true);
                handleSelect(value);
            } else if (key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setOpened(false);
            }
        };

        if (!isOptionShown(option)) {
            return;
        }

        return (
            <Box
                ref={setRef(optionId) as React.Ref<HTMLDivElement>}
                tabIndex={finalDisabled ? -1 : 0}
                className={prefix('__option-wrapper')}
                onClick={() => {
                    if (finalDisabled) return;
                    handleSelect(value);
                }}
                onFocus={(e) => {
                    if (finalDisabled) return;
                    setFocusedVisibleId(
                        e.currentTarget.matches(':focus-visible') ? optionId : null,
                    );
                    setFocusedId(optionId);
                }}
                onBlur={() => {
                    setFocusedId(null);
                    setFocusedVisibleId(null);
                    setPressed(false);
                }}
                onKeyDown={(e) => {
                    if (finalDisabled) return;
                    handleKeyDown(e);
                }}
                onKeyUp={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') setPressed(false);
                }}
                onMouseDown={() => {
                    if (finalDisabled) return;
                    setPressed(true);
                }}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                role="option"
                id={optionId}
                aria-selected={selected || undefined}
                aria-disabled={finalDisabled || undefined}
            >
                <Box
                    className={prefix('__option')}
                    data-pseudo-focused={focusedVisibleId === optionId ? true : undefined}
                    data-pseudo-active={pressed || undefined}
                    data-selected={selected || undefined}
                    data-disabled={finalDisabled}
                >
                    {children}
                </Box>
            </Box>
        );
    },
);

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
