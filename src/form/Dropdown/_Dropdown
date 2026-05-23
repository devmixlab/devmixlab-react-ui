import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import type { Placement } from '@floating-ui/react';
import { Box } from '../../Box/Box';
import { Button, type ButtonImplProps } from '../../Button/Button';
import { useFormFieldContext } from '../FormField/formField.context';
import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';
import { useStableId } from '../../utils/useStableId';
import { SearchInput } from '../SearchInput/SearchInput';
import { Text } from '../../Text/Text';
import { ChevronDown as ChevronDownIcon } from '../../Icon';
import { useFloatingLayer, useFocusableList, useTypeahead } from '../../hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DropdownOptionProps = {
    value: string;
    label?: string;
    disabled?: boolean;
    children: React.ReactNode;
};

export type DropdownProps = {
    children?: React.ReactNode;
    className?: string;
    id?: string;

    chevron?: boolean;

    searchable?: boolean;
    searchPlaceholder?: string;

    visibleOptions?: number;
    placement?: Placement;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: React.ReactNode;
    invalid?: boolean;

    triggerRender?: (props: {
        selectedOption?: DropdownOptionProps;
        opened?: boolean;
        disabled?: boolean;
    }) => React.ReactElement;
} & ButtonImplProps;

type DropdownComponent = React.ForwardRefExoticComponent<
    DropdownProps & React.RefAttributes<HTMLDivElement>
> & {
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

            searchable = false,
            searchPlaceholder,

            visibleOptions = 6,
            placement = 'bottom-end',
            type = 'button',
            value,
            defaultValue,
            onChange,
            placeholder = 'Select option',

            invalid = false,
            disabled = false,

            rounded = 'md',
            size = 'md',

            triggerRender,

            ...rest
        },
        ref,
    ) => {
        const dropdownId = id ?? useStableId('dropdown');

        // ------------------------------------------------------------------
        // Open / search state
        // ------------------------------------------------------------------

        const [opened, setOpened] = useState(false);
        const [search, setSearch] = useState('');

        useEffect(() => {
            if (!opened) {
                setFocuses(null);
                if (searchable && search.length > 0) setSearch('');
            }
        }, [opened]);

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
        // Parse children → options
        // ------------------------------------------------------------------

        const parsedOptions: DropdownOptionProps[] = React.Children.toArray(children)
            .filter((child): child is React.ReactElement<DropdownOptionProps> =>
                React.isValidElement(child),
            )
            .map((child) => ({
                value: child.props.value,
                label: child.props.label,
                disabled: child.props.disabled,
                children: child.props.children,
            }));

        const filteredOptions = useMemo(() => {
            if (!searchable || !search.trim()) return parsedOptions;

            const normalized = search.toLowerCase().trim();
            return parsedOptions.filter((option) =>
                (option.label ?? option.value).toLowerCase().trim().includes(normalized),
            );
        }, [parsedOptions, search, searchable]);

        const selectedOption = useMemo(
            () => parsedOptions.find((option) => option.value === selectedValue),
            [parsedOptions, selectedValue],
        );

        // ------------------------------------------------------------------
        // Floating (positioning + dismiss)
        // ------------------------------------------------------------------

        const { refs, floatingStyles, getReferenceProps, getFloatingProps } = useFloatingLayer(
            opened,
            setOpened,
            placement,
        );

        const combinedRef = mergeRefs(refs.setReference, ref);

        // ------------------------------------------------------------------
        // Focusable list (keyboard nav + focus tracking)
        // ------------------------------------------------------------------

        const {
            focused: optionFocused,
            focusedVisible: optionFocusedVisible,
            setFocused: setOptionFocused,
            setFocusedVisible: setOptionFocusedVisible,
            setFocuses,
            focusFirst,
            focusLast,
            focusNext,
            setRef: setOptionRef,
            firstFocusableIndex,
            lastFocusableIndex,
            itemRefs: optionRefs,
        } = useFocusableList(filteredOptions);

        useEffect(() => {
            if (optionFocused == null) return;
            optionRefs.current[optionFocused]?.scrollIntoView({ block: 'nearest' });
        }, [optionFocused]);

        // ------------------------------------------------------------------
        // Typeahead
        // ------------------------------------------------------------------

        const getFilteredItems = () => filteredOptions;

        const focusByTypeahead = useTypeahead(
            (index) => optionRefs.current[index]?.focus(),
            getFilteredItems,
        );

        // ------------------------------------------------------------------
        // Refs
        // ------------------------------------------------------------------

        const searchInputRef = useRef<HTMLInputElement | null>(null);

        // ------------------------------------------------------------------
        // Focus helper
        // ------------------------------------------------------------------

        const focusTrigger = () => {
            (refs.reference.current as HTMLDivElement | null)?.focus();
        };

        // ------------------------------------------------------------------
        // Handlers
        // ------------------------------------------------------------------

        const handleSelect = (nextValue: string) => {
            if (!isControlled) setInternalValue(nextValue);
            onChange?.(nextValue);
            setOpened(false);
            focusTrigger();
            setFocuses(null);
            setOptionPressed(null);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            const key = e.key;

            if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                focusByTypeahead(key);
                return;
            }

            if (key === 'Enter' || key === ' ') {
                e.preventDefault();
                setPressed(true);
                setOpened((prev) => !prev);
            } else if (key === 'ArrowDown') {
                e.preventDefault();
                if (!opened) {
                    setOpened(true);
                    return;
                }
                focusNext();
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                if (!opened) {
                    setOpened(true);
                    return;
                }
                focusNext(-1);
            } else if (key === 'Home') {
                e.preventDefault();
                focusFirst();
            } else if (key === 'End') {
                e.preventDefault();
                focusLast();
            } else if (key === 'Escape') {
                setOpened(false);
                focusTrigger();
                setFocuses(null);
                setOptionPressed(null);
            }
        };

        const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
            const key = e.key;

            if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                focusByTypeahead(key);
                return;
            }

            if (key === 'ArrowDown') {
                e.preventDefault();
                if (searchable && index === lastFocusableIndex) {
                    searchInputRef.current?.focus();
                    return;
                }
                focusNext();
            } else if (key === 'ArrowUp') {
                e.preventDefault();
                if (searchable && index === firstFocusableIndex) {
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
                setOptionPressed(index);
                if (optionFocused == null) return;
                handleSelect(filteredOptions[optionFocused].value);
            } else if (key === 'Escape') {
                setOpened(false);
                focusTrigger();
                setFocuses(null);
                setOptionPressed(null);
            }
        };

        // ------------------------------------------------------------------
        // Context
        // ------------------------------------------------------------------

        const ctx = useFormFieldContext();
        const isInvalid = ctx ? ctx.hasError || invalid : invalid;

        // ------------------------------------------------------------------
        // Render
        // ------------------------------------------------------------------

        return (
            <Box
                className={prefix()}
                w="full"
                data-size={size}
                style={{ '--visible-options': visibleOptions } as React.CSSProperties}
            >
                {/* Trigger */}
                <Box
                    ref={combinedRef}
                    {...getReferenceProps()}
                    className={prefix('__trigger')}
                    onClick={() => {
                        if (disabled) return;
                        setOpened((prev) => !prev);
                    }}
                    tabIndex={disabled ? -1 : 0}
                    onFocus={(e) => {
                        if (disabled) return;
                        setTriggerFocusedVisible(e.currentTarget.matches(':focus-visible'));
                    }}
                    onBlur={() => setTriggerFocusedVisible(false)}
                    onKeyDown={(e) => {
                        if (disabled) return;
                        handleKeyDown(e);
                    }}
                    onKeyUp={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') setPressed(false);
                    }}
                    onMouseDown={() => {
                        if (disabled) return;
                        setPressed(true);
                    }}
                    onMouseUp={() => setPressed(false)}
                    onMouseLeave={() => setPressed(false)}
                    aria-invalid={isInvalid || undefined}
                    aria-expanded={opened}
                    aria-haspopup="listbox"
                    aria-controls={opened ? dropdownId : undefined}
                >
                    {triggerRender ? (
                        triggerRender({ selectedOption, opened, disabled })
                    ) : (
                        <Button
                            type={type}
                            disabled={disabled}
                            pseudoFocused={triggerFocusedVisible}
                            pseudoActive={pressed}
                            rounded={rounded}
                            size={size}
                            className={className}
                            {...rest}
                            active={opened}
                            endIcon={
                                chevron && (
                                    <ChevronDownIcon
                                        className={prefix('__chevron')}
                                        data-opened={opened || undefined}
                                        aria-hidden
                                    />
                                )
                            }
                        >
                            {selectedOption?.children ?? (
                                <Box as="span" opacity={0.8}>
                                    {placeholder}
                                </Box>
                            )}
                        </Button>
                    )}
                </Box>

                {/* Floating menu */}
                {opened && (
                    <Box
                        ref={refs.setFloating}
                        id={dropdownId}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        rounded={rounded}
                        className={prefix('__menu')}
                        role="listbox"
                        shadow="lg"
                    >
                        {/* Search */}
                        {searchable && (
                            <Box className={prefix('__search-wrapper')}>
                                <SearchInput
                                    ref={searchInputRef}
                                    value={search}
                                    clearable
                                    onValueChange={setSearch}
                                    autoFocus
                                    placeholder={searchPlaceholder ?? 'Search...'}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            focusFirst();
                                        } else if (e.key === 'Escape') {
                                            setOpened(false);
                                            focusTrigger();
                                            setFocuses(null);
                                            setOptionPressed(null);
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
                                        Showing {filteredOptions.length} of {parsedOptions.length}
                                    </Text>
                                )}

                                {filteredOptions.length === 0 && (
                                    <Text
                                        variant="body-sm"
                                        emphasis="muted"
                                        px="md"
                                        pb="sm"
                                        pt="md"
                                    >
                                        No results found
                                    </Text>
                                )}
                            </Box>
                        )}

                        {/* Options */}
                        <Box tabIndex={-1} className={prefix('__menu-wrapper')}>
                            {filteredOptions.map((option, index) => {
                                const selected = option.value === selectedValue;
                                const finalDisabled = disabled || option.disabled || false;

                                return (
                                    <Box
                                        ref={setOptionRef(index) as React.Ref<HTMLDivElement>}
                                        tabIndex={finalDisabled ? -1 : 0}
                                        key={option.value}
                                        className={prefix('__option-wrapper')}
                                        onClick={() => {
                                            if (finalDisabled) return;
                                            handleSelect(option.value);
                                        }}
                                        onFocus={(e) => {
                                            if (finalDisabled) return;
                                            setOptionFocusedVisible(
                                                e.currentTarget.matches(':focus-visible')
                                                    ? index
                                                    : null,
                                            );
                                            setOptionFocused(index);
                                        }}
                                        onBlur={() => {
                                            setOptionFocused(null);
                                            setOptionFocusedVisible(null);
                                            setOptionPressed(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (finalDisabled) return;
                                            handleOptionKeyDown(e, index);
                                        }}
                                        onKeyUp={(e: React.KeyboardEvent) => {
                                            if (e.key === 'Enter' || e.key === ' ')
                                                setOptionPressed(null);
                                        }}
                                        onMouseDown={() => {
                                            if (finalDisabled) return;
                                            setOptionPressed(index);
                                        }}
                                        onMouseUp={() => setOptionPressed(null)}
                                        onMouseLeave={() => setOptionPressed(null)}
                                        role="option"
                                        id={`${dropdownId}-option-${index}`}
                                        aria-selected={selected || undefined}
                                        aria-disabled={finalDisabled || undefined}
                                    >
                                        <Box
                                            className={prefix('__option')}
                                            data-pseudo-focused={
                                                optionFocusedVisible === index ? true : undefined
                                            }
                                            data-pseudo-active={
                                                optionPressed === index ? true : undefined
                                            }
                                            data-selected={selected || undefined}
                                            data-disabled={option.disabled}
                                        >
                                            {option.children}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    },
) as DropdownComponent;

Dropdown.displayName = 'Dropdown';

// ---------------------------------------------------------------------------
// DropdownOption
// ---------------------------------------------------------------------------

const DropdownOption = ({ children }: DropdownOptionProps) => <>{children}</>;
DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
