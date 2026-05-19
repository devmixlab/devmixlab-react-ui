import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
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
import { Box, type BoxProps } from '../../Box/Box';
import { Button, type ButtonImplProps } from '../../Button/Button';
import { FieldRoot, type Variant } from '../FieldRoot/FieldRoot';
import { useFormFieldContext } from '../FormField/formField.context';

import { TriangleDown as TriangleDownIcon } from '../../Icon';

import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';

import { Size } from '../form.tokens';

export type DropdownProps = {
    children?: React.ReactNode;
    className?: string;

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

    optionRender?: (props: {
        option: DropdownOptionProps;
        selected: boolean;
        active: boolean;
    }) => React.ReactNode;
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

            optionRender,
            triggerRender,

            ...rest
        },
        ref,
    ) => {
        const [triggerFocusedVisible, setTriggerFocusedVisible] = useState(false);
        const [triggerFocused, setTriggerFocused] = useState(false);
        const [optionFocusedVisible, setOptionFocusedVisible] = useState<number | null>(null);
        const [optionFocused, setOptionFocused] = useState<number | null>(null);
        const [optionPressed, setOptionPressed] = useState<number | null>(null);
        const [pressed, setPressed] = useState(false);
        const [opened, setOpened] = useState(false);

        const setOptionFocuses = (index: number, indexVisible?: number) => {
            setOptionFocused(index);
            setOptionFocusedVisible(indexVisible ?? index);
        };

        useEffect(() => {
            if (!opened) {
                setOptionFocuses(null);
            }
        }, [opened]);

        useEffect(() => {
            if (optionFocused == null) return;

            const node = optionRefs.current[optionFocused];

            node?.scrollIntoView({
                block: 'nearest',
            });
        }, [optionFocused]);

        const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
        const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
            open: opened,
            onOpenChange: setOpened,

            placement,

            transform: false,

            whileElementsMounted: autoUpdate,

            middleware: [offset(4), flip(), shift({ padding: 8 })],
        });
        const triggerEl = refs.reference.current as HTMLDivElement | null;

        const dismiss = useDismiss(context);

        const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

        const parsedOptions: DropdownOptionProps[] = React.Children.toArray(children)
            .filter((child): child is React.ReactElement<DropdownOptionProps> =>
                React.isValidElement(child),
            )
            .map((child) => ({
                value: child.props.value,
                disabled: child.props.disabled,
                children: child.props.children,
            }));

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
            triggerEl?.focus();
        };

        // const focusNextOption = (index) => {
        //     const first = optionRefs.current.find(Boolean);
        //
        //     first?.focus();
        // };

        const focusFirstOption = () => {
            const first = optionRefs.current.find(Boolean);

            first?.focus();
        };

        const focusLastOption = () => {
            const reversed = [...optionRefs.current].reverse();

            const last = reversed.find(Boolean);

            last?.focus();
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();

                    setOpened((prev) => !prev);

                    break;

                case 'ArrowDown':
                    e.preventDefault();

                    if (!opened) {
                        setOpened(true);
                    } else {
                        focusFirstOption();
                    }

                    break;

                case 'ArrowUp':
                    e.preventDefault();

                    if (!opened) {
                        setOpened(true);
                    } else {
                        focusLastOption();
                    }

                    break;

                case 'Escape':
                    setOpened(false);
                    break;
            }
        };

        const findNextFocusableOption = (
            index: number,
            direction: 1 | -1 = 1,
        ): { option: DropdownOptionProps; index: number } | null => {
            const nextIndex = index + direction;
            const next = parsedOptions[nextIndex];

            if (!next) return null;
            return !next.disabled
                ? { option: next, index: nextIndex }
                : findNextFocusableOption(nextIndex, direction);
        };

        const handleOptionKeyDown = (e: React.KeyboardEvent) => {
            const pressedKey = e.key;

            if (pressedKey == 'ArrowDown') {
                e.preventDefault();

                if (optionFocusedVisible == null) {
                    setOptionFocuses(0);
                    return;
                }

                const nextObj = findNextFocusableOption(optionFocusedVisible, 1);
                setOptionFocuses(nextObj?.index ?? 0);
                optionRefs.current[nextObj?.index ?? 0]?.focus();
            } else if (pressedKey == 'ArrowUp') {
                e.preventDefault();

                if (optionFocusedVisible == null) {
                    setOptionFocuses(parsedOptions.length - 1);
                    return;
                }

                const nextObj = findNextFocusableOption(optionFocusedVisible, -1);
                setOptionFocuses(nextObj?.index ?? parsedOptions.length - 1);
            } else if (pressedKey == 'Enter') {
                if (optionFocused == null) return;
                const option = parsedOptions[optionFocused];
                handleSelect(option.value);
            }
            // switch (e.key) {
            //     // case 'Enter':
            //     // case ' ':
            //     //     e.preventDefault();
            //     //
            //     //     setOpened((prev) => !prev);
            //     //
            //     //     break;
            //
            //     case 'ArrowDown':
            //         e.preventDefault();
            //
            //         if (optionFocusedVisible == null) {
            //             setOptionFocuses(0);
            //             return;
            //         }
            //
            //         const nextObj = findNextFocusableOption(optionFocusedVisible, 1);
            //         setOptionFocuses(nextObj?.index ?? 0);

            //         break;
            //
            //     case 'ArrowUp':
            //         e.preventDefault();
            //
            //         if (optionFocusedVisible == null) {
            //             setOptionFocuses(parsedOptions.length - 1);
            //             return;
            //         }
            //
            //         const nextObj = findNextFocusableOption(optionFocusedVisible, -1);
            //         setOptionFocuses(nextObj?.index ?? parsedOptions.length - 1);
            //
            //         break;
            //
            //     case 'Escape':
            //         setOpened(false);
            //         break;
            // }
        };

        return (
            <Box
                className={prefix()}
                w="full"
                data-size={size}
                style={{
                    '--visible-options': visibleOptions,
                }}
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
                        setTriggerFocusedVisible(e.currentTarget.matches(':focus-visible'));
                        setTriggerFocused(true);
                    }}
                    onBlur={() => {
                        setTriggerFocused(false);
                        setTriggerFocusedVisible(false);
                    }}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setPressed(false);
                        }
                    }}
                    aria-invalid={isInvalid || undefined}
                    aria-expanded={opened}
                    aria-haspopup="listbox"
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
                        style={floatingStyles}
                        {...getFloatingProps()}
                        rounded={rounded}
                        className={prefix('__menu')}
                        role="listbox"
                        shadow="lg"
                    >
                        {parsedOptions.map((option, index) => {
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
                                        console.log(index);
                                        handleOptionKeyDown(e, index);
                                    }}
                                    onKeyUp={(e: React.KeyboardEvent) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setOptionPressed(index);
                                        }
                                    }}
                                    onMouseDown={() => {
                                        setOptionPressed(index);
                                    }}
                                    onMouseUp={() => {
                                        setOptionPressed(null);
                                    }}
                                    onMouseLeave={() => {
                                        setOptionPressed(null);
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                    // data-selected={selected || undefined}
                                    // data-disabled={option.disabled}
                                >
                                    {optionRender ? (
                                        optionRender({ option, selected, active: false })
                                    ) : (
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
                                    )}
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    },
) as DropdownComponent;

Dropdown.displayName = 'Dropdown';

type DropdownOptionProps = {
    value: string;
    disabled: boolean;
    children: React.ReactNode;
};

const DropdownOption = ({ children }: DropdownOptionProps) => {
    return <>{children}</>;
};

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
