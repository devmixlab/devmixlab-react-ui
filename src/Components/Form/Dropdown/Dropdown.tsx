import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  ComponentProps,
} from 'react';
import { Box, BoxProps, BoxDerived, BoxDerivedProps } from '../../Box';
import { useFormFieldContext } from '../FormField/FormField.context';
import { classPrefix } from '../../../utils/classPrefix';
import { useStableId } from '../../../utils';
import { SearchInput, SearchInputProps } from '../SearchInput';
import { Text } from '../../Text';
import { useFocusableList, useTypeahead } from '../../../hooks';
import {
  Popover,
  PopoverTriggerRenderProps,
  PopoverPanelProps,
  PopoverProps,
  PopoverTriggerProps,
  usePopoverStateContext,
} from '../../Popover';
import { clsx } from 'clsx';
import { DropdownContext, useDropdownContext, DropdownContextValue } from './Dropdown.context';
import { GroupContext, useGroupContext, GroupContextValue } from './Group.context';
import { mergeRefs } from '../../../utils';
import { FieldLayoutProps, FieldRoot, fieldRootPropKeys, SharedFieldRootProps } from '../FieldRoot';
import { ChevronDown as ChevronDownIcon } from '../../Icon';
import { splitProps } from '../../../utils/splitProps';
import { ButtonProps } from '../../Button';
import { getNextZIndex } from '../../../utils/zIndex';
import { FocusableListResult } from '../../../hooks/useFocusableList';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OptionValue<T extends string | number, Nullable extends boolean> = Nullable extends true
  ? T | null
  : T;

export type OptionValueImpl = string | number | null;

export type OnReadyCallbackProps = {
  isSearchable: boolean;
  searchInputRef: React.RefObject<HTMLInputElement>;
};

export type DropdownOptionData = {
  id: string;
  value: OptionValueImpl;
  label?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  ref?: HTMLElement | null;
  group?: GroupContextValue;
};

export type DropdownPropsCommon = {
  // children?: React.ReactNode;
  // id?: string;
  open?: boolean;
  defaultOpen?: boolean;

  // enables chevron on trigger
  chevron?: boolean;

  // sets how many visible options available till scroll will be applied
  visibleOptions?: number;

  placeholder?: React.ReactNode;
  invalid?: boolean;
  triggerRender?: (props: PopoverTriggerRenderProps) => React.ReactNode;
  stickyGroupLabels?: boolean;
  openOnArrowKeys?: boolean;
  invokeOnly?: boolean;
  returnFocusOnOptionPick?: boolean;
  autoFocusOption?: boolean;

  shouldUnregister?: boolean;
} & PopoverProps &
  ComponentProps<'div'>;

export type DropdownPropsImpl = {
  nullable?: boolean;
  value?: OptionValueImpl;
  defaultValue?: OptionValueImpl;
  onValueChange?: (value: OptionValueImpl) => void;
} & DropdownPropsCommon;

export type DropdownPropsNullable<T extends string | number = string> = {
  nullable: true;
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
} & DropdownPropsCommon;

export type DropdownPropsNonNullable<T extends string | number = string> = {
  nullable?: false;
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
} & DropdownPropsCommon;

export type DropdownProps<T extends string | number = string> =
  | DropdownPropsNullable<T>
  | DropdownPropsNonNullable<T>;

type DropdownComponent = (<T extends string | number = string>(
  props: DropdownProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null) & {
  displayName?: string;

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
// Dropdown Implementation
// ---------------------------------------------------------------------------

function DropdownImpl(
  {
    children,
    id,

    chevron = true,

    open,
    defaultOpen,
    onOpenChange,

    visibleOptions = 6,

    value,
    defaultValue,
    onValueChange,
    placeholder = 'Select option',
    nullable = false,

    invalid = false,
    disabled = false,

    triggerRender,

    stickyGroupLabels = false,

    openOnArrowKeys = true,
    invokeOnly = false,
    modal = false,

    onUnmount,
    onEntered,
    onReady,

    returnFocusOnOptionPick = false,
    autoFocusOption = true,

    shouldUnregister = false,

    ...rest
  }: DropdownPropsImpl,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  // ------------------------------------------------------------------
  // Open / search state
  // ------------------------------------------------------------------

  const [options, setOptions] = useState<DropdownOptionData[]>([]);

  const isOpenControlled = open !== undefined;

  const [internalOpened, setInternalOpened] = useState(defaultOpen ?? false);

  const opened = isOpenControlled ? open : internalOpened;

  const setOpened: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    const nextValue = typeof value === 'function' ? value(opened) : value;

    if (!isOpenControlled) {
      setInternalOpened(nextValue);
    }

    onOpenChange?.(nextValue);
  };

  const [isSearchable, setIsSearchable] = useState(false);
  const [search, setSearch] = useState('');
  const [isPanelHovered, setIsPanelHovered] = useState(false);

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
  const [internalValue, setInternalValue] = useState<OptionValueImpl>(defaultValue ?? null);
  const selectedValue = isControlled ? value : internalValue;

  // ------------------------------------------------------------------
  // Filter options -> filteredOptions
  // ------------------------------------------------------------------

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    const normalized = search.toLowerCase().trim();
    return options.filter((option) =>
      (option.label ?? String(option.value ?? '')).toLowerCase().trim().includes(normalized),
    );
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue],
  );

  const isOptionShown = useCallback(
    (option: DropdownOptionData) => {
      return filteredOptions.some((o) => o.id === option.id);
    },
    [filteredOptions],
  );

  const isGroupShown = useCallback(
    (group: GroupContextValue) => {
      return filteredOptions.some((option) => option.group?.id === group.id);
    },
    [filteredOptions],
  );

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
  const enteredCallbacksRef = useRef<Array<() => void>>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const runOnEntered = useCallback((callback: () => void) => {
    enteredCallbacksRef.current.push(callback);
  }, []);

  const flushOnEnteredCallbacks = useCallback(() => {
    const callbacks = enteredCallbacksRef.current;

    enteredCallbacksRef.current = [];

    callbacks.forEach((callback) => {
      callback();
    });
  }, []);

  const handleSelect = (nextValue: OptionValueImpl) => {
    if (!isControlled && !invokeOnly) setInternalValue(nextValue);
    onValueChange?.(nextValue);
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
      modal,
      opened,
      setOpened,
      nullable,
      returnFocusOnOptionPick,
      autoFocusOption,
      triggerRef,
      panelRef,
      isPanelHovered,
      setIsPanelHovered,
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
      shouldUnregister,
      runAfterReady,
      runOnEntered,
      stickyGroupLabels,
      openOnArrowKeys,
      invokeOnly,
    }),
    [
      modal,
      opened,
      nullable,
      returnFocusOnOptionPick,
      autoFocusOption,
      triggerRef,
      panelRef,
      isPanelHovered,
      handleSelect,
      focusByTypeahead,
      isOptionShown,
      isGroupShown,
      disabled,
      isInvalid,
      isSearchable,
      search,
      searchInputRef,
      focusableList,
      selectedOption,
      selectedValue,
      options,
      filteredOptions,
      registerOption,
      unregisterOption,
      shouldUnregister,
      runAfterReady,
      runOnEntered,
      stickyGroupLabels,
      openOnArrowKeys,
      invokeOnly,
    ],
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <DropdownContext.Provider value={ctxValue}>
      <Popover
        {...rest}
        modal={modal}
        open={opened}
        onOpenChange={setOpened}
        // open={opened}
        hiddenStrategy="visibility"
        // onOpenChange={(state) => {
        //   onOpenChange?.(state);
        //   setOpened(state);
        // }}
        disabled={disabled}
        onUnmount={() => {
          if (search.length > 0) setSearch('');

          onUnmount?.();
        }}
        onEntered={() => {
          flushOnEnteredCallbacks();

          onEntered?.();
        }}
        onReady={() => {
          flushReadyCallbacks();

          onReady?.();
        }}
        keepMounted
        role="listbox"
      >
        {children}
      </Popover>
    </DropdownContext.Provider>
  );
}

const Dropdown = forwardRef(DropdownImpl) as unknown as DropdownComponent;

Dropdown.displayName = 'Dropdown';

// ---------------------------------------------------------------------------
// DropdownTrigger
// ---------------------------------------------------------------------------

type DropdownRenderContent = {
  selectedOption?: DropdownOptionData;
  selectedValue?: OptionValueImpl;
  focusableList: FocusableListResult;
};

type DropdownTriggerProps = {
  placeholder?: React.ReactNode;
} & ComponentProps<'button'> &
  PopoverTriggerProps<DropdownRenderContent>;

const DropdownTrigger = forwardRef<HTMLElement, DropdownTriggerProps>(
  ({ children, placeholder = 'Select option', render, onKeyDown, ...rest }, ref) => {
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
      options,
      triggerRef,
      panelRef,
      runOnEntered,
      invokeOnly,
      autoFocusOption,
    } = useDropdownContext();

    const mergedRef = mergeRefs(ref, triggerRef);

    const { focusFirst, focusLast, focusById, itemRefs, firstFocusableId } = focusableList;

    const renderContent: DropdownRenderContent = { selectedOption, selectedValue, focusableList };

    useEffect(() => {
      if (!opened || !autoFocusOption) {
        return;
      }

      runOnEntered(() => {
        if (isSearchable) {
          searchInputRef.current?.focus();
          return;
        }

        if (selectedOption) {
          focusById(selectedOption.id);
        } else {
          focusFirst();
        }
      });
    }, [
      opened,
      selectedOption,
      focusById,
      focusFirst,
      isSearchable,
      searchInputRef,
      runOnEntered,
      autoFocusOption,
    ]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      const key = e.key;

      if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        focusByTypeahead(key);
        return;
      }

      if (key === 'ArrowUp' && openOnArrowKeys) {
        // console.log(234234234);
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
        if (!opened) {
          setOpened(true);
          return;
        }

        setOpened(false);
      }
    };

    const triggerClassName = prefix('__trigger');

    const triggerProps = {
      // ref: mergedRef,
      ...rest,
      // invokeOnly,
      onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!disabled) {
          handleKeyDown(e);
        }

        onKeyDown?.(e);
      },
    };

    const triggerContent = invokeOnly ? children : (selectedOption?.children ?? children);

    return render ? (
      <Popover.Trigger
        ref={mergedRef}
        className={triggerClassName}
        {...triggerProps}
        renderContent={renderContent}
        render={render}
      />
    ) : (
      <Popover.Trigger ref={mergedRef} className={triggerClassName} {...triggerProps}>
        {triggerContent ?? (
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

type DropdownFieldTriggerProps = DropdownTriggerProps & FieldLayoutProps & SharedFieldRootProps;

const DropdownFieldTrigger = forwardRef<HTMLElement, DropdownFieldTriggerProps>(
  ({ controls, placeholder = 'Select option', children, chevron = 'none', ...rest }, ref) => {
    const [fieldRootProps, controlProps] = splitProps(rest, fieldRootPropKeys);

    const ctx = useDropdownContext();

    const ctxFormField = useFormFieldContext();
    const isInvalid = ctxFormField ? ctxFormField.hasError || ctx.invalid : ctx.invalid;

    const [triggerActive, setTriggerActive] = useState(true);

    useEffect(() => {
      if (ctx.opened) {
        setTriggerActive(true);
        return;
      }

      const timeout = setTimeout(() => {
        setTriggerActive(false);
      }, 300);

      return () => clearTimeout(timeout);
    }, [ctx.opened]);

    return (
      <DropdownTrigger
        ref={ref}
        {...rest}
        render={({ ref: triggerRef, content, triggerProps, opened, disabled, ...rest }) => {
          const { selectedOption, selectedValue } = content;

          // const { ref: triggerRef, ...restTriggerProps } = triggerProps;

          const isActive = !disabled ? opened || (ctx.modal && triggerActive) : undefined;

          const triggerContent = ctx.invokeOnly ? children : (selectedOption?.children ?? children);

          return (
            <FieldRoot
              invalid={isInvalid}
              className={prefix('__trigger')}
              active={isActive}
              pseudoHovered={ctx.isPanelHovered}
              controls={
                <>
                  {controls}
                  {chevron && (chevron === 'fixed' || chevron === 'rotate') && (
                    <ChevronDownIcon
                      className={prefix('__chevron')}
                      data-opened={chevron === 'rotate' ? opened || undefined : undefined}
                      aria-hidden
                    />
                  )}
                </>
              }
              {...fieldRootProps}
              data-selected={selectedValue}
            >
              <Box
                ref={triggerRef as any}
                as="button"
                type="button"
                className={classPrefix('--field')}
                {...controlProps}
                {...triggerProps}
              >
                {/*{selectedOption ? selectedOption?.children : (children ?? 'Select ...')}*/}
                {triggerContent ?? (
                  <Box as="span" opacity={0.8}>
                    {placeholder}
                  </Box>
                )}
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
  ({ children, className, size = 'md', onMouseEnter, onMouseLeave, zIndex, ...rest }, ref) => {
    const { panelRef, setIsPanelHovered } = useDropdownContext();

    const { opened } = usePopoverStateContext();

    const [resolvedZIndex, setResolvedZIndex] = useState<PopoverPanelProps['zIndex']>();

    useEffect(() => {
      if (opened && resolvedZIndex == null) {
        setResolvedZIndex(zIndex ?? getNextZIndex('dropdown'));
      }
    }, [opened, resolvedZIndex, zIndex]);

    const mergedRef = mergeRefs(ref, panelRef);

    return (
      <Popover.Panel
        zIndex={resolvedZIndex}
        ref={mergedRef}
        className={prefix('__content')}
        {...rest}
        data-size={size}
        onMouseEnter={(e) => {
          setIsPanelHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsPanelHovered(false);
          onMouseLeave?.(e);
        }}
      >
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
      triggerRef,
      modal,
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
          // w="full"
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
              requestAnimationFrame(() => {
                triggerRef.current?.focus();
              });
            } else if (e.key === 'Tab' && !modal) {
              e.preventDefault();

              setOpened(false);
              requestAnimationFrame(() => {
                // focusRelativeToElement(triggerRef.current, e.shiftKey ? -1 : 1);
                triggerRef.current?.focus();
              });
              return;
            }
          }}
        />

        {search.trim() && (
          <Text className={prefix('__search-results')} variant="body-sm" emphasis="muted" pt="sm">
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
  value: OptionValueImpl;
  label?: string;
  disabled?: boolean;
  render?: (props: OptionRenderProps) => React.ReactNode;
} & BoxDerivedProps &
  React.HTMLAttributes<HTMLElement>;

const DropdownOption = forwardRef<HTMLElement, DropdownOptionProps>(
  (
    { id, value, label, disabled, children, className, onClick, onKeyDown, render, ...rest },
    ref,
  ) => {
    // const finalId = id ?? useStableId('dropdown-option');
    const optionId = String(id ?? value ?? useStableId('dropdown-option'));

    const {
      registerOption,
      unregisterOption,
      disabled: ctxDisabled,
      nullable,
      selectedValue,
      focusableList,
      handleSelect,
      focusByTypeahead,
      isSearchable,
      searchInputRef,
      setOpened,
      opened,
      isOptionShown,
      returnFocusOnOptionPick,
      triggerRef,
      modal,
      invokeOnly,
      shouldUnregister,
    } = useDropdownContext();

    const group = useGroupContext();

    useEffect(() => {
      if (value === null && !nullable) {
        console.error(
          '[Dropdown] A null option value was provided, but the Dropdown is not nullable. ' +
            'Set nullable={true} to allow null option values.',
        );
      }
    }, [value, nullable]);

    const {
      setRef,
      setFocusedId,
      focusNext,
      focusFirst,
      focusLast,
      lastFocusableId,
      firstFocusableId,
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
      return () => {
        if (shouldUnregister) {
          unregisterOption(optionId);
        }
      };
    }, [optionId, value, label, finalDisabled, children, group, shouldUnregister]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      const key = e.key;

      if (key.length === 1 && key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        focusByTypeahead(key);
        return;
      }

      if (key === 'ArrowDown') {
        e.preventDefault();
        if (optionId === lastFocusableId) {
          if (isSearchable) {
            searchInputRef.current?.focus();
          } else {
            focusFirst();
          }
          return;
        }
        focusNext();
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (optionId === firstFocusableId) {
          // searchInputRef.current?.focus();
          if (isSearchable) {
            searchInputRef.current?.focus();
          } else {
            focusLast();
          }
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
        e.preventDefault();
        e.stopPropagation();
        handleSelect(value);
        if (returnFocusOnOptionPick)
          requestAnimationFrame(() => {
            triggerRef.current?.focus();
          });
      } else if (key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpened(false);
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      } else if (key === 'Tab' && !modal) {
        e.preventDefault();

        setOpened(false);
        requestAnimationFrame(() => {
          // focusRelativeToElement(triggerRef.current, e.shiftKey ? -1 : 1);
          triggerRef.current?.focus();
        });
        return;
      }
    };

    const mergedRef = mergeRefs(setRef(optionId), ref);

    const optionProps: DropdownOptionElementProps = {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        onClick?.(e);

        // if (!finalDisabled) {
        //   handleSelect(value);
        //   if (returnFocusOnOptionPick)
        //     requestAnimationFrame(() => {
        //       triggerRef.current?.focus();
        //     });
        // }

        if (!finalDisabled) {
          if (value === null && !nullable) {
            console.error('[Dropdown] Cannot select a null option when nullable is false.');
            return;
          }

          handleSelect(value);

          if (returnFocusOnOptionPick)
            requestAnimationFrame(() => {
              triggerRef.current?.focus();
            });
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
      <BoxDerived className={optionClassName} {...optionProps} {...rest}>
        {children}
      </BoxDerived>
    );
  },
);

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
