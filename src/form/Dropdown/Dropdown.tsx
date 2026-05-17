import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

import { Box, type BoxProps } from '../../Box/Box';
import { FieldRoot, type Variant } from '../FieldRoot/FieldRoot';
import { useFormFieldContext } from '../FormField/formField.context';

import { TriangleDown as TriangleDownIcon } from '../../Icon';

import { mergeRefs } from '../../utils/mergeRefs';
import { classPrefix } from '../../utils/classPrefix';

import { Size } from '../form.tokens';

export type DropdownProps = {
    children?: React.ReactNode;

    value?: string;
    defaultValue?: string;

    onChange?: (value: string) => void;

    placeholder?: React.ReactNode;

    disabled?: boolean;
    invalid?: boolean;

    variant?: Variant;
    size?: Size;

    rounded?: BoxProps['rounded'];

    start?: React.ReactNode;
    end?: React.ReactNode;
    actions?: React.ReactNode;
    controls?: React.ReactNode;

    className?: string;
};

type DropdownComponent = React.ForwardRefExoticComponent<
    DropdownProps & React.RefAttributes<HTMLButtonElement>
> & {
    Option: typeof DropdownOption;
};

const Dropdown = forwardRef<HTMLButtonElement, DropdownProps>(
    (
        {
            children,

            value,
            defaultValue,
            onChange,

            placeholder = 'Select option',

            disabled = false,
            invalid = false,

            variant = 'outlined',
            size = 'md',

            rounded = 'md',

            start,
            end,
            actions,
            controls,

            className,
        },
        ref,
    ) => {
        const triggerRef = useRef<HTMLButtonElement>(null);
        const dropdownRef = useRef<HTMLDivElement>(null);

        const parsedOptions = React.Children.toArray(children)
            .filter((child): child is React.ReactElement<DropdownOptionProps> =>
                React.isValidElement(child),
            )
            .map((child) => ({
                value: child.props.value,
                disabled: child.props.disabled,
                label: child.props.children,
            }));

        const combinedRef = mergeRefs(triggerRef, ref);

        const ctx = useFormFieldContext();

        const isInvalid = ctx ? ctx.hasError || invalid : invalid;

        const isControlled = value !== undefined;

        const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

        const selectedValue = isControlled ? value : internalValue;

        const [opened, setOpened] = useState(false);

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

        useEffect(() => {
            if (!opened) return;

            const handlePointerDown = (event: MouseEvent) => {
                const target = event.target as Node;

                if (triggerRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
                    return;
                }

                setOpened(false);
            };

            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setOpened(false);
                }
            };

            window.addEventListener('mousedown', handlePointerDown);
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('mousedown', handlePointerDown);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [opened]);

        const cl = clsx(className, classPrefix('--dropdown'));

        const finalControls = (
            <>
                {controls}
                <TriangleDownIcon />
            </>
        );

        return (
            <Box pos="relative" w="full">
                <FieldRoot
                    className={cl}
                    invalid={isInvalid}
                    disabled={disabled}
                    rounded={rounded}
                    focusTargetRef={triggerRef}
                    start={start}
                    end={end}
                    actions={actions}
                    controls={finalControls}
                    variant={variant}
                    size={size}
                >
                    <Box
                        as="button"
                        ref={combinedRef}
                        type="button"
                        className={classPrefix('--field')}
                        disabled={disabled}
                        aria-invalid={isInvalid || undefined}
                        aria-expanded={opened}
                        aria-haspopup="listbox"
                        onClick={() => {
                            if (disabled) return;

                            setOpened((prev) => !prev);
                        }}
                    >
                        {selectedOption?.label ?? (
                            <Box as="span" opacity={0.6}>
                                {placeholder}
                            </Box>
                        )}
                    </Box>
                </FieldRoot>

                {opened && (
                    <Box
                        ref={dropdownRef}
                        pos="absolute"
                        top="calc(100% + 4px)"
                        left={0}
                        w="full"
                        zIndex={1000}
                        rounded={rounded}
                        className={classPrefix('--dropdown-menu')}
                        role="listbox"
                    >
                        {parsedOptions.map((option) => {
                            const selected = option.value === selectedValue;

                            return (
                                <Box
                                    key={option.value}
                                    as="button"
                                    type="button"
                                    w="full"
                                    textAlign="left"
                                    px={size}
                                    py="sm"
                                    disabled={option.disabled}
                                    className={classPrefix('--dropdown-option')}
                                    data-selected={selected || undefined}
                                    onClick={() => {
                                        if (option.disabled) return;

                                        handleSelect(option.value);
                                    }}
                                    role="option"
                                    aria-selected={selected}
                                >
                                    {option.label}
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
    disabled?: boolean;
    children: React.ReactNode;
};

const DropdownOption = ({ children }: DropdownOptionProps) => {
    return <>{children}</>;
};

DropdownOption.displayName = 'DropdownOption';

Dropdown.Option = DropdownOption;

export { Dropdown };
