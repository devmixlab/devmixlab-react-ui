import React, { forwardRef, useRef, useEffect, useId, useState } from 'react';
import clsx from 'clsx';
import { Box, type BoxProps } from '../../Box/Box';
import { Size } from '../Input/input.tokens';
import { mergeRefs } from '../../utils/mergeRefs';
import { Check as CheckIcon } from '../../Icon/Check';
import { Indeterminate as IndeterminateIcon } from '../../Icon/Indeterminate';
import { CLASS_PREFIX } from '../../constants';
import { useCheckboxGroupContext } from './checkboxGroup.context';
import { Value } from './CheckboxGroup';

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    size?: Size;
    invalid?: boolean;
    rounded?: BoxProps['rounded'];
    children?: React.ReactNode;
    indeterminate?: boolean;
    description?: React.ReactNode;
    labelPosition?: 'left' | 'right';

    onCheckedChange?: (checked: boolean) => void;
};

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--input-control${name}`;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            className,
            size = 'md',
            disabled,
            invalid,
            children,
            indeterminate,
            description,
            labelPosition = 'right',
            onChange,

            checked,
            defaultChecked,

            onCheckedChange,
            ...rest
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const group = useCheckboxGroupContext();
        const valueProp = rest.value as Value | undefined;

        const [uncontrolledChecked, setUncontrolledChecked] = useState(() =>
            Boolean(defaultChecked),
        );

        const isInGroup = group && valueProp !== undefined;

        const isControlled = typeof checked === 'boolean';
        const isChecked = isInGroup
            ? group.value.includes(valueProp)
            : isControlled
              ? checked
              : uncontrolledChecked;

        const id = rest.id ?? useId();

        useEffect(() => {
            if (inputRef.current) {
                inputRef.current.indeterminate = indeterminate ?? false;
            }
        }, [indeterminate]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isInGroup) {
                group.toggle(valueProp);
            } else {
                if (!isControlled) {
                    setUncontrolledChecked(e.target.checked);
                }
            }

            onChange?.(e);
            if (isInGroup) {
                const nextChecked = !group.value.includes(valueProp);
                onCheckedChange?.(nextChecked);
            } else {
                onCheckedChange?.(e.target.checked);
            }
        };

        const descriptionId = description && id ? `${id}-desc` : undefined;

        return (
            <label
                className={clsx(
                    prefix(),
                    prefix('--checkbox'),
                    prefix(`--size-${size}`),
                    className,
                    {
                        [prefix(`--disabled`)]: disabled,
                    },
                )}
            >
                <Box
                    as="input"
                    {...rest}
                    type="checkbox"
                    name={group?.name ?? rest.name}
                    disabled={group?.disabled ?? disabled}
                    onChange={handleChange}
                    id={id}
                    ref={combinedRef}
                    className={prefix('__input')}
                    aria-invalid={invalid || undefined}
                    aria-checked={indeterminate ? 'mixed' : isChecked}
                    data-state={
                        indeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'
                    }
                    data-disabled={disabled || undefined}
                    data-invalid={invalid || undefined}
                    aria-describedby={descriptionId}
                    checked={isChecked}
                />

                {labelPosition === 'left' && children && (
                    <span className={prefix('__label')}>{children}</span>
                )}

                <span
                    className={clsx(prefix('__control'), {
                        [prefix('__control--indeterminate')]: indeterminate,
                    })}
                >
                    {indeterminate ? (
                        <IndeterminateIcon className={prefix('__checkmark')} />
                    ) : (
                        <CheckIcon className={prefix('__checkmark')} />
                    )}
                </span>

                {labelPosition === 'right' && children && (
                    <span className={prefix('__label')}>{children}</span>
                )}

                {description && descriptionId && (
                    <span id={descriptionId} className={prefix('__description')}>
                        {description}
                    </span>
                )}
            </label>
        );
    },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
