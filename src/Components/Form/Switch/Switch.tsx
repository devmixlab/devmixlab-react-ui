import React, { forwardRef, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box';
import { mergeRefs } from '../../../utils/mergeRefs';
import { useSwitchGroup } from './SwitchGroup.context';
import { useStableId } from '../../../utils/useStableId';
import { classPrefix } from '../../../utils/classPrefix';

//-----------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------
type Intent = 'danger' | 'warning' | 'success' | 'info' | 'secondary' | (string & {});

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    size?: 'sm' | 'md' | 'lg';
    intent?: Intent;
    variant?: string;
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: 'left' | 'right';
    onCheckedChange?: (checked: boolean) => void;
};

//-----------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------
export const prefix = (name: string = '') => {
    return classPrefix(`--switch${name}`);
};

//-----------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------
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
            variant,
            onChange,
            checked,
            defaultChecked,
            onCheckedChange,
            readOnly: isReadOnly,
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

        useEffect(() => {
            if (group && !name) {
                console.warn('Switch inside SwitchGroup requires a "name" prop');
            }
        }, [group, name]);

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
            if (isReadOnly) {
                e.preventDefault();
                return;
            }

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
                data-readonly={isReadOnly || undefined}
                data-size={size}
                data-testid="switch"
                data-name={name}
                data-intent={intent}
                data-variant={variant}
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
                    onClick={isReadOnly ? (e) => e.preventDefault() : undefined}
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

export type { Intent, SwitchProps };
