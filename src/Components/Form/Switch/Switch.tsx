import React, { forwardRef, useRef, useEffect, useId, useState, useMemo } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box/Box';
import { mergeRefs } from '../../../utils/mergeRefs';
import { CLASS_PREFIX } from '../../../constants';
import { useSwitchGroup } from './switchGroup.context';
import { useStableId } from '../../../utils/useStableId';

export type Intent = 'danger' | 'warning' | 'success' | 'info';

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    size?: 'sm' | 'md' | 'lg';
    intent?: Intent;
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: 'left' | 'right';
    onCheckedChange?: (checked: boolean) => void;
};

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--switch${name}`;
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
            intent,
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

        const group = useSwitchGroup();
        const name = rest.name;

        if (group && !name) {
            console.warn('Switch inside SwitchGroup requires a "name" prop');
        }

        const isDisabled = disabled || group?.disabled;
        const isChecked =
            group && name
                ? (group.value[name] ?? false)
                : isControlled
                  ? checked
                  : uncontrolledChecked;

        const id = useStableId('dru-switch', rest.id);
        const descriptionId = description ? `${id}-desc` : undefined;
        const labelId = children ? `${id}-label` : undefined;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const next = e.target.checked;

            if (group && name) {
                group.toggle(name, next);
            } else {
                if (!isControlled) {
                    setUncontrolledChecked(next);
                }
            }

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
                className={clsx(prefix(), className)}
                data-state={isChecked ? 'checked' : 'unchecked'}
                data-disabled={isDisabled || undefined}
                data-size={size}
                data-testid="switch"
                data-name={name}
                {...(intent ? { ['data-intent']: intent } : {})}
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
                    checked={isChecked}
                    onChange={handleChange}
                    ref={combinedRef}
                    disabled={isDisabled}
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
