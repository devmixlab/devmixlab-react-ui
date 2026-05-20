import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
    useFloating,
    useDismiss,
    useInteractions,
    offset,
    flip,
    shift,
    autoUpdate,
    Placement,
} from '@floating-ui/react';
import { Box } from '../../Box/Box';
import { Button, type ButtonImplProps } from '../../Button/Button';
import { useFormFieldContext } from '../FormField/formField.context';
import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';
import { useStableId } from '../../utils/useStableId';
import { SearchInput } from '../SearchInput/SearchInput';
import { Text } from '../../Text/Text';

export type DropdownProps = {
    children?: React.ReactNode;
    className?: string;
    id?: string;

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

const prefix = (name: string = '') => {
    return classPrefix(`--dropdown${name}`);
};

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
    (
        {
            children,
            className,
            id,

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
        const [triggerFocusedVisible, setTriggerFocusedVisible] = useState(false);
        const [optionFocusedVisible, setOptionFocusedVisible] = useState<number | null>(null);
        const [optionFocused, setOptionFocused] = useState<number | null>(null);
        const [optionPressed, setOptionPressed] = useState<number | null>(null);
        const [pressed, setPressed] = useState(false);
        const [opened, setOpened] = useState(false);
        const [search, setSearch] = useState('');

        const setOptionFocuses = (index: number | null, indexVisible?: number | null) => {
            setOptionFocused(index);
            setOptionFocusedVisible(indexVisible ?? index);
        };

        useEffect(() => {
            if (!opened) {
                setOptionFocuses(null);
                if (searchable && search.length > 0) setSearch('');
            }
        }, [opened]);

        useEffect(() => {
            if (optionFocused == null) return;

            const node = optionRefs.current[optionFocused];

            node?.scrollIntoView({
                block: 'nearest',
            });
        }, [optionFocused]);

        const searchInputRef = useRef<HTMLInputElement | null>(null);

        const typeaheadRef = useRef('');
        const typeaheadTimestampRef = useRef(0);

        const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
        const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
            open: opened,
            onOpenChange: setOpened,

            placement,

            transform: false,

            whileElementsMounted: autoUpdate,

            middleware: [offset(4), flip(), shift({ padding: 8 })],
        });

        const focusTrigger = () => {
            (refs.reference.current as HTMLDivElement | null)?.focus();
        };

        const dismiss = useDismiss(context);

        const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

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
            if (!searchable || !search.trim()) {
                return parsedOptions;
            }

            const normalized = search.toLowerCase().trim();

            return parsedOptions.filter((option) => {
                const text = (option.label ?? option.value).toLowerCase().trim();

                return text.includes(normalized);
            });
        }, [parsedOptions, search, searchable]);

        const findLastFocusableIndex = (options: DropdownOptionProps[]) => {
            for (let i = options.length - 1; i >= 0; i--) {
                if (!options[i].disabled) {
                    return i;
                }
            }

            return -1;
        };

        const firstFocusableIndex = filteredOptions.findIndex((option) => !option.disabled);
        const lastFocusableIndex = findLastFocusableIndex(filteredOptions);

        const combinedRef = mergeRefs(refs.setReference, ref);

        const ctx = useFormFieldContext();

        const isInvalid = ctx ? ctx.hasError || invalid : invalid;

        const isControlled = value !== undefined;

        const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

        const selectedValue = isControlled ? value : internalValue;

        const selectedOption = useMemo(
            () => parsedOptions.find((option) => option.value === selectedValue),
            [parsedOptions, selectedValue],
        );

        const handleSelect = (nextValue: string) => {
            if (!isControlled) {
                setInternalValue(nextValue);
            }

            onChange?.(nextValue);

            setOpened(false);
            focusTrigger();

            setOptionFocuses(null);
            setOptionPressed(null);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            const pressedKey = e.key;

            if (
                pressedKey.length === 1 &&
                pressedKey !== ' ' &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey
            ) {
                focusByTypeahead(pressedKey);

                return;
            }

            if (pressedKey == 'Enter' || pressedKey == ' ') {
                e.preventDefault();

                setPressed(true);
                setOpened((prev) => !prev);
            } else if (pressedKey == 'ArrowDown') {
                e.preventDefault();

                if (!opened) {
                    setOpened(true);
                    return;
                }

                focusNext();
            } else if (pressedKey == 'ArrowUp') {
                e.preventDefault();

                if (!opened) {
                    setOpened(true);
                    return;
                }

                focusNext(-1);
            } else if (pressedKey == 'Home') {
                e.preventDefault();

                focusFirst();
            } else if (pressedKey == 'End') {
                e.preventDefault();

                focusLast();
            } else if (pressedKey == 'Escape') {
                setOpened(false);
                focusTrigger();
                setOptionFocuses(null);
                setOptionPressed(null);
            }
        };

        /*
         * ring buffers
         * circular queues
         * cyclic iterators
         * toroidal grids
         * round-robin schedulers
         * */
        const findNextFocusableOption = (
            startIndex: number,
            direction: 1 | -1 = 1,
        ): number | null => {
            if (!filteredOptions.length) return null;

            let index = startIndex;

            for (let i = 0; i < filteredOptions.length; i++) {
                /*
                 * circular indexing, wrap-around indexing, safe modulo wrap-around
                 * circular indexing using modular arithmetic
                 * The mathematical idea behind it is: modular arithmetic
                 * You’ll also hear: index normalization
                 * */
                index = (index + direction + filteredOptions.length) % filteredOptions.length;

                const option = filteredOptions[index];

                if (!option.disabled) {
                    return index;
                }
            }

            return null;
        };

        const focusFirst = () => {
            const firstIndex = filteredOptions.findIndex((option) => !option.disabled);

            if (firstIndex === -1) return;

            optionRefs.current[firstIndex]?.focus();
        };

        const focusLast = () => {
            for (let i = filteredOptions.length - 1; i >= 0; i--) {
                if (!filteredOptions[i].disabled) {
                    optionRefs.current[i]?.focus();

                    return;
                }
            }
        };

        const focusNext = (direction: 1 | -1 = 1) => {
            const startIndex =
                optionFocused == null
                    ? direction === 1
                        ? filteredOptions.length - 1
                        : 0
                    : optionFocused;

            const nextIndex = findNextFocusableOption(startIndex, direction);

            if (nextIndex == null) return;

            optionRefs.current[nextIndex]?.focus();
        };

        const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
            const pressedKey = e.key;

            if (
                pressedKey.length === 1 &&
                pressedKey !== ' ' &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.altKey
            ) {
                focusByTypeahead(pressedKey);

                return;
            }

            if (pressedKey == 'ArrowDown') {
                e.preventDefault();

                if (searchable && index === lastFocusableIndex) {
                    searchInputRef.current?.focus();

                    return;
                }

                focusNext();
            } else if (pressedKey == 'ArrowUp') {
                e.preventDefault();

                if (searchable && index === firstFocusableIndex) {
                    searchInputRef.current?.focus();

                    return;
                }

                focusNext(-1);
            } else if (pressedKey == 'Home') {
                e.preventDefault();

                focusFirst();
            } else if (pressedKey == 'End') {
                e.preventDefault();

                focusLast();
            } else if (pressedKey == 'Enter' || pressedKey === ' ') {
                setOptionPressed(index);
                if (optionFocused == null) return;
                handleSelect(filteredOptions[optionFocused].value);
            } else if (pressedKey == 'Escape') {
                setOpened(false);
                focusTrigger();
                setOptionFocuses(null);
                setOptionPressed(null);
            }
        };

        const focusByTypeahead = (key: string) => {
            const now = Date.now();

            if (now - typeaheadTimestampRef.current > 500) {
                typeaheadRef.current = '';
            }

            typeaheadTimestampRef.current = now;

            typeaheadRef.current += key.toLowerCase();

            const search = typeaheadRef.current;

            const matchedIndex = filteredOptions.findIndex((option) => {
                if (option.disabled) return false;

                const text = (option.label ?? option.value).toLowerCase().trim();

                return text.startsWith(search);
            });

            if (matchedIndex === -1) return;

            optionRefs.current[matchedIndex]?.focus();
        };

        return (
            <Box
                className={prefix()}
                w="full"
                data-size={size}
                style={
                    {
                        '--visible-options': visibleOptions,
                    } as React.CSSProperties
                }
            >
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
                    onBlur={() => {
                        setTriggerFocusedVisible(false);
                    }}
                    onKeyDown={(e) => {
                        if (disabled) return;

                        handleKeyDown(e);
                    }}
                    onKeyUp={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setPressed(false);
                        }
                    }}
                    onMouseDown={() => {
                        if (disabled) return;

                        setPressed(true);
                    }}
                    onMouseUp={() => {
                        setPressed(false);
                    }}
                    onMouseLeave={() => {
                        setPressed(false);
                    }}
                    aria-invalid={isInvalid || undefined}
                    aria-expanded={opened}
                    aria-haspopup="listbox"
                    aria-controls={opened ? dropdownId : undefined}
                >
                    {triggerRender ? (
                        triggerRender({
                            selectedOption,
                            opened,
                            disabled,
                        })
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
                        >
                            {selectedOption?.children ?? (
                                <Box as="span" opacity={0.8}>
                                    {placeholder}
                                </Box>
                            )}
                        </Button>
                    )}
                </Box>
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
                        {searchable && (
                            <Box className={prefix('__search-wrapper')}>
                                <SearchInput
                                    // size={size}
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
                                        } else if (e.key == 'Escape') {
                                            setOpened(false);
                                            focusTrigger();
                                            setOptionFocuses(null);
                                            setOptionPressed(null);
                                        }
                                    }}
                                    // size={size}
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
                        <Box tabIndex={-1} className={prefix('__menu-wrapper')}>
                            {filteredOptions.map((option, index) => {
                                const selected = option.value === selectedValue;
                                const finalDisabled = disabled || option.disabled || false;

                                return (
                                    <Box
                                        ref={(node) => {
                                            optionRefs.current[index] = node;
                                        }}
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
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setOptionPressed(null);
                                            }
                                        }}
                                        onMouseDown={() => {
                                            if (finalDisabled) return;

                                            setOptionPressed(index);
                                        }}
                                        onMouseUp={() => {
                                            setOptionPressed(null);
                                        }}
                                        onMouseLeave={() => {
                                            setOptionPressed(null);
                                        }}
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

type DropdownOptionProps = {
    value: string;
    label?: string;
    disabled?: boolean;
    children: React.ReactNode;
};

const DropdownOption = ({ children }: DropdownOptionProps) => {
    return <>{children}</>;
};

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
