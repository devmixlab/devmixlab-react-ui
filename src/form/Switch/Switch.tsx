import React, { forwardRef, useRef, useEffect, useId, useState, useMemo } from 'react';
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
        const labelId = children ? `${id}-label` : undefined;

        useEffect(() => {
            if (!isControlled) {
                setUncontrolledChecked(Boolean(defaultChecked));
            }
        }, [defaultChecked, isControlled]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) {
                setUncontrolledChecked(e.target.checked);
            }

            const next = e.target.checked;

            onChange?.(e);
            onCheckedChange?.(next);
        };

        const labelNode =
            children || description ? (
                <span className={prefix('__text')}>
                    {children && (
                        <span id={labelId} className={prefix('__label')}>
                            {children}
                        </span>
                    )}
                    {description && (
                        <span id={descriptionId} className={prefix('__description')}>
                            {description}
                        </span>
                    )}
                </span>
            ) : null;

        return (
            <label
                className={clsx(prefix(), prefix('--switch'), prefix(`--size-${size}`), className, {
                    [prefix('--disabled')]: disabled,
                })}
                data-state={isChecked ? 'checked' : 'unchecked'}
                data-disabled={disabled || undefined}
                data-size={size}
            >
                {labelPosition === 'left' && labelNode}

                <Box
                    as="input"
                    type="checkbox"
                    id={id}
                    {...rest}
                    role="switch"
                    aria-checked={isChecked}
                    aria-labelledby={labelId || undefined}
                    aria-label={labelId ? undefined : rest['aria-label']}
                    aria-describedby={descriptionId}
                    {...(isControlled ? { checked } : { defaultChecked })}
                    onChange={handleChange}
                    ref={combinedRef}
                    disabled={disabled}
                    className={prefix('__input')}
                />

                <span className={prefix('__track')}>
                    <span className={prefix('__thumb')} />
                </span>

                {labelPosition === 'right' && labelNode}
            </label>
        );
    },
);

Switch.displayName = 'Switch';

export { Switch };
