import React, { forwardRef, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Box, BoxProps } from '../../Box';
import { useFormFieldContext } from '../FormField/FormField.context';
import { classPrefix } from '../../../utils/classPrefix';
import { useStableId } from '../../../utils/useStableId';
import { SearchInput, SearchInputProps } from '../SearchInput';
import { Text } from '../../../Text/Text';
import { useFocusableList, useTypeahead } from '../../../hooks';
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
import { mergeRefs } from '../../../utils/mergeRefs';
import { FieldRoot, SharedFieldRootProps } from '../FieldRoot';
import { TriangleDown as TriangleDownIcon } from '../../../Icon';
import { PopoverTriggerElementProps } from '../../Popover/Popover';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OnReadyCallbackProps = {
    isSearchable: boolean;
    searchInputRef: React.RefObject<HTMLInputElement>;
};

export type DropdownOptionData = {
    id: string;
    value: string;
    label?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    ref?: HTMLElement | null;
    group?: GroupContextValue;
};

// export type DropdownGroupData = {
//     id: string;
//     label?: string;
// };

export type DropdownProps = {
    children?: React.ReactNode;
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

    stickyGroupLabels?: boolean;

    openOnArrowKeys?: boolean;
} & PopoverProps;

type DropdownComponent = React.ForwardRefExoticComponent<
    DropdownProps & React.RefAttributes<HTMLDivElement>
> & {
    Trigger: typeof DropdownTrigger;
    FieldTrigger: typeof DropdownFieldTrigger;
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
            id,

            chevron = true,
            onOpenChange,

            visibleOptions = 6,

            value,
            defaultValue,
            onChange,
            placeholder = 'Select option',

            invalid = false,
            disabled = false,

            triggerRender,

            stickyGroupLabels = false,

            openOnArrowKeys = true,

            ...rest
        },
        ref,
    ) => {
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

        const isGroupShown = (group: GroupContextValue) => {
            return filteredOptions.some((option) => option.group?.id === group.id);
        };

        // ------------------------------------------------------------------
        // Focusable list (keyboard nav + focus tracking)
        // ------------------------------------------------------------------

        const focusableList = useFocusableList(filteredOptions);
        const { focusedId: optionFocused, setFocuses, itemRefs: optionRefs } = focusableList;

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
                isGroupShown,
                disabled,
                invalid: isInvalid,
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
                stickyGroupLabels,
                openOnArrowKeys,
            }),
            [
                opened,
                setOpened,
                triggerRef,
                handleSelect,
                focusByTypeahead,
                isOptionShown,
                isGroupShown,
                disabled,
                invalid,
                isInvalid,
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
                stickyGroupLabels,
                openOnArrowKeys,
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
                    disabled={disabled}
                    onUnmount={() => {
                        if (search.length > 0) setSearch('');
                    }}
                    onReady={() => {
                        flushReadyCallbacks();
                    }}
                    role="listbox"
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

type DropdownRenderContent = {
    selectedOption?: DropdownOptionData;
    selectedValue?: string;
};

type DropdownTriggerProps = {
    placeholder?: React.ReactNode;
} & PopoverTriggerProps<DropdownRenderContent>;

const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(
    ({ placeholder = 'Select option', render, onKeyDown, ...rest }, ref) => {
        const {
            selectedOption,
            selectedValue,
            isSearchable,
            focusableList,
            searchInputRef,
            setOpened,
            opened,
            runAfterReady,
            focusByTypeahead,
            openOnArrowKeys,
            disabled,
        } = useDropdownContext();

        const { focusFirst, focusLast, focusById } = focusableList;

        const renderContent: DropdownRenderContent = { selectedOption, selectedValue };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
            const key = e.key;

            if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                focusByTypeahead(key);
                return;
            }

            if (key === 'ArrowUp' && openOnArrowKeys) {
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
            } else if (key === 'ArrowDown' && openOnArrowKeys) {
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

        const triggerClassName = prefix('__trigger');

        const triggerProps = {
            ref,
            ...rest,
            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                if (!disabled) {
                    handleKeyDown(e);
                }

                onKeyDown?.(e);
            },
        };

        return render ? (
            <Popover.Trigger
                className={triggerClassName}
                {...triggerProps}
                renderContent={renderContent}
                render={render}
            />
        ) : (
            <Popover.Trigger className={triggerClassName} {...triggerProps}>
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
// DropdownFieldTrigger
// ---------------------------------------------------------------------------

type DropdownFieldTriggerProps = DropdownTriggerProps & SharedFieldRootProps;

const DropdownFieldTrigger = forwardRef<HTMLElement, DropdownFieldTriggerProps>(
    ({ start, end, actions, controls, children, ...rest }, ref) => {
        return (
            <DropdownTrigger
                ref={ref}
                {...rest}
                render={({ content, triggerProps, ...rest }) => {
                    const { selectedOption, selectedValue } = content;

                    const { ref: triggerRef, ...restTriggerProps } = triggerProps;
                    return (
                        <FieldRoot
                            focusVisibleOnly
                            start={start}
                            end={end}
                            actions={actions}
                            controls={
                                <>
                                    {controls}
                                    <TriangleDownIcon />
                                </>
                            }
                        >
                            <Box
                                ref={triggerRef as React.Ref<HTMLButtonElement>}
                                as="button"
                                type="button"
                                className={classPrefix('--field')}
                                {...restTriggerProps}
                            >
                                {selectedValue ?? 'Select ...'}
                            </Box>
                        </FieldRoot>
                    );
                }}
            />
        );
    },
);

DropdownFieldTrigger.displayName = 'DropdownFieldTrigger';

Dropdown.FieldTrigger = DropdownFieldTrigger;

// ---------------------------------------------------------------------------
// DropdownContent
// ---------------------------------------------------------------------------

type DropdownContentProps = {
    size?: 'sm' | 'md' | 'lg';
} & PopoverPanelProps;

const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
    ({ children, className, size = 'md', ...rest }, ref) => {
        return (
            <Popover.Panel ref={ref} className={prefix('__content')} {...rest} data-size={size}>
                {children}
            </Popover.Panel>
        );
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
            <Box tabIndex={-1} ref={ref} className={clsx(prefix('__list'), className)} {...rest}>
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
    className?: string;
    label?: string;
} & BoxProps;

const DropdownGroup = forwardRef<HTMLDivElement, DropdownGroupProps>(
    ({ children, className, label, ...rest }, ref) => {
        const { isGroupShown } = useDropdownContext();

        const id = useStableId('-group');
        const group = useMemo(() => ({ id, label }), [id, label]);

        const mountedRef = useRef(false);

        useEffect(() => {
            mountedRef.current = true;
        }, []);

        const shown = !mountedRef.current || isGroupShown(group);

        if (!shown) {
            return null;
        }

        return (
            <GroupContext.Provider value={group}>
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
    className?: string;
    sticky?: boolean;
} & BoxProps;

const DropdownLabel = forwardRef<HTMLDivElement, DropdownLabelProps>(
    ({ children, className, sticky, ...rest }, ref) => {
        const { stickyGroupLabels } = useDropdownContext();

        const resolvedSticky = sticky ?? stickyGroupLabels;

        return (
            <Box
                ref={ref}
                className={clsx(prefix('__group-label'), className)}
                {...rest}
                data-sticky={resolvedSticky}
            >
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

export type DropdownOptionElementProps = React.HTMLAttributes<HTMLDivElement> & {
    ref?: React.Ref<HTMLDivElement>;

    role: 'option';

    'aria-selected'?: boolean;
    'aria-disabled'?: boolean;

    'data-selected'?: boolean;
    'data-disabled'?: boolean;
};

export type OptionRenderProps = {
    disabled: boolean;
    opened: boolean;
    setOpened: (open: boolean) => void;
    optionClassName: string;
    optionProps: DropdownOptionElementProps;
};

export type DropdownOptionProps = {
    value: string;
    label?: string;
    disabled?: boolean;
    render?: (props: OptionRenderProps) => React.ReactNode;
} & BoxProps &
    React.HTMLAttributes<HTMLElement>;

const DropdownOption = forwardRef<HTMLElement, DropdownOptionProps>(
    (
        { id, value, label, disabled, children, className, onClick, onKeyDown, render, ...rest },
        ref,
    ) => {
        // const finalId = id ?? useStableId('dropdown-option');
        const optionId = id ?? value;

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
            opened,
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
                handleSelect(value);
            } else if (key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setOpened(false);
            }
        };

        const mergedRef = mergeRefs(setRef(optionId), ref);

        const optionProps: DropdownOptionElementProps = {
            onClick: (e: React.MouseEvent<HTMLElement>) => {
                onClick?.(e);

                if (!finalDisabled) {
                    handleSelect(value);
                }
            },

            onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                if (!finalDisabled) {
                    handleKeyDown(e);
                }

                onKeyDown?.(e);
            },

            onFocus: (e: React.FocusEvent<HTMLElement>) => {
                if (finalDisabled) return;
                setFocusedId(optionId);
            },

            ref: mergedRef,
            id: optionId,
            role: 'option',

            tabIndex: finalDisabled ? -1 : 0,

            'aria-selected': selected || undefined,
            'aria-disabled': finalDisabled || undefined,
            'data-selected': selected || undefined,
            'data-disabled': finalDisabled || undefined,
        };

        const optionClassName = prefix('__option');

        if (!isOptionShown(option)) {
            return;
        }

        if (render) {
            return render({
                disabled: !!disabled,
                opened,
                setOpened,
                optionClassName,
                optionProps,
            });
        }

        return (
            <Box className={optionClassName} {...optionProps} {...rest}>
                {children}
            </Box>
        );
    },
);

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
