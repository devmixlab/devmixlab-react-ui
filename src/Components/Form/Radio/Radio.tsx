import React, { forwardRef, useRef, useEffect, useId, useState, useMemo } from 'react';
import clsx from 'clsx';
import { Box } from '../../Box/Box';
import { mergeRefs } from '../../../utils/mergeRefs';
import { CLASS_PREFIX } from '../../../constants';
import { useRadioGroup } from './radioGroup.context';

export type Size = 'sm' | 'md' | 'lg';
export type Intent = 'danger' | 'warning' | 'success' | 'info';

type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
    value: string;
    intent?: Intent;
    size?: Size;
    children?: React.ReactNode;
    description?: React.ReactNode;
    labelPosition?: 'left' | 'right';
};

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--radio${name}`;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            className,
            size,
            disabled,
            children,
            description,
            labelPosition = 'right',
            value,
            intent,
            onChange,
            ...rest
        },
        ref,
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);
        const combinedRef = mergeRefs(inputRef, ref);

        const group = useRadioGroup();

        // if (!group) {
        //     console.warn('Radio should be used inside RadioGroup for proper behavior');
        // }

        const finalSize = size ?? group?.size ?? 'sm';
        const name = rest.name ?? group?.name ?? undefined;

        const isDisabled = disabled || group?.disabled;
        const isChecked = group ? group.value === value : rest.checked === true;

        const id = rest.id ?? useId();
        const descriptionId = description ? `${id}-desc` : undefined;
        const labelId = children ? `${id}-label` : undefined;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (group) group.onValueChange?.(value);
            onChange?.(e);
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
                data-size={finalSize}
                {...(intent ? { ['data-intent']: intent } : {})}
            >
                {labelPosition === 'left' && labelNode}

                <Box
                    as="input"
                    type="radio"
                    id={id}
                    name={name}
                    value={value}
                    {...rest}
                    {...(group ? { checked: isChecked } : {})}
                    onChange={handleChange}
                    ref={combinedRef}
                    disabled={isDisabled}
                    // aria-checked={isChecked}
                    aria-labelledby={labelId || undefined}
                    aria-describedby={descriptionId}
                    aria-label={labelId ? undefined : rest['aria-label']}
                    className={prefix('__input')}
                />

                <span className={prefix('__control')}>
                    <span className={prefix('__indicator')} />
                </span>

                {labelPosition === 'right' && labelNode}
            </label>
        );
    },
);

Radio.displayName = 'Radio';

export { Radio };
