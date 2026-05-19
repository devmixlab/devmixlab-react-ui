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
        const [triggerFocused, setTriggerFocused] = useState(false);
        const [pressed, setPressed] = useState(false);

        const [opened, setOpened] = useState(false);

        const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
            open: opened,
            onOpenChange: setOpened,

            placement,

            transform: false,

            whileElementsMounted: autoUpdate,

            middleware: [offset(4), flip(), shift({ padding: 8 })],
        });

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

        return (
            <Box className={prefix()} w="full">
                <Box
                    ref={combinedRef}
                    {...getReferenceProps()}
                    className={prefix('__trigger')}
                    onClick={() => {
                        if (disabled) return;
                        setOpened((prev) => !prev);
                    }}
                    tabIndex={disabled ? -1 : 0}
                    onFocus={() => setTriggerFocused(true)}
                    onBlur={() => setTriggerFocused(false)}
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
                            pseudoFocused={triggerFocused}
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
                        {parsedOptions.map((option) => {
                            const selected = option.value === selectedValue;

                            return (
                                <Box
                                    key={option.value}
                                    tabIndex={option.disabled ? -1 : 0}
                                    className={prefix('__option-wrapper')}
                                    onClick={() => {
                                        if (option.disabled) return;
                                        handleSelect(option.value);
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                    data-selected={selected || undefined}
                                    data-disabled={option.disabled}
                                >
                                    {optionRender ? (
                                        optionRender({ option, selected, active: false })
                                    ) : (
                                        <Box px={size} py="sm" className={prefix('__option')}>
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
