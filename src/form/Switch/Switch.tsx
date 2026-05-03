import React, { forwardRef, useRef, useEffect, useId, useState } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box/Box';
import { mergeRefs } from '../../utils/mergeRefs';
import { CLASS_PREFIX } from '../../constants';

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    size?: 'sm' | 'md' | 'lg';
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: 'left' | 'right';
    onCheckedChange?: (checked: boolean) => void;
};

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--input-control${name}`;
};

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    (
        {
            className,
            size = 'md',
            disabled,
            children,
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

        const [uncontrolledChecked, setUncontrolledChecked] = useState(() =>
            Boolean(defaultChecked),
        );

        const isControlled = typeof checked === 'boolean';
        const isChecked = isControlled ? checked : uncontrolledChecked;

        const id = rest.id ?? useId();
        const descriptionId = description ? `${id}-desc` : undefined;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) {
                setUncontrolledChecked(e.target.checked);
            }

            onChange?.(e);
            onCheckedChange?.(e.target.checked);
        };

        return (
            <label
                className={clsx(prefix(), prefix('--switch'), prefix(`--size-${size}`), className, {
                    [prefix('--disabled')]: disabled,
                })}
            >
                {labelPosition === 'left' && children && (
                    <span className={prefix('__label')}>{children}</span>
                )}

                <Box
                    as="input"
                    {...rest}
                    type="checkbox"
                    role="switch"
                    aria-checked={isChecked}
                    aria-describedby={descriptionId}
                    checked={isChecked}
                    onChange={handleChange}
                    id={id}
                    ref={combinedRef}
                    disabled={disabled}
                    className={prefix('__input')}
                />

                <span className={prefix('__track')}>
                    <span className={prefix('__thumb')} />
                </span>

                {labelPosition === 'right' && children && (
                    <span className={prefix('__label')}>{children}</span>
                )}

                {description && (
                    <span id={descriptionId} className={prefix('__description')}>
                        {description}
                    </span>
                )}
            </label>
        );
    },
);

Switch.displayName = 'Switch';

export { Switch };
