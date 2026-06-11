import React, { forwardRef, useState, useCallback } from 'react';
import {
    createPolymorphic,
    type PolymorphicComponent,
    PolymorphicProps,
} from '../../types/polymorphic';
import { Card } from '../Card';
// import { type CardProps } from '../Card/Card';
import { Box } from '../Box';
import type { BoxProps } from '../Box';
import clsx from 'clsx';
import { Info, Warning, Success, Close } from '../../Icon';
import { sizeToDensityMap, Intent, Variant, Size } from './alert.tokens';
import { Button } from '../Button';
// import { OwnChipProps } from '../Chip';
import { classPrefix } from '../../utils/classPrefix';

export const prefix = (name: string = '') => {
    return classPrefix(`--alert${name}`);
};

type OwnAlertProps = {
    intent?: Intent;
    variant?: Variant;
    size?: Size;
    icon?: boolean | React.ReactNode;

    accent?: 'left' | 'top';
    actions?: React.ReactNode;

    onDismiss?: () => void;
} & Omit<BoxProps, 'size'>;

type ImplAlertProps<C extends React.ElementType = 'div'> = PolymorphicProps<C, OwnAlertProps>;

// type AlertProps = {
//     children: React.ReactNode;
//     intent?: Intent;
//     variant?: Variant;
//     size?: Size;
//     className?: string;
//     icon?: boolean | React.ReactNode;
//
//     dismissible?: boolean;
//     onDismiss?: () => void;
// } & Omit<BoxProps, 'size'>;

const defaultIcons: Record<Intent, React.ReactNode> = {
    primary: null,
    secondary: null,
    success: <Success />,
    warning: <Warning />,
    danger: <Warning />,
    info: <Info />,
};

const AlertImpl = <C extends React.ElementType = 'div'>(
    {
        children,
        className,

        intent = 'primary',
        variant = 'base',
        size = 'md',

        rounded = 'md',

        icon,
        dismissible,
        custom,
        onDismiss,
        ...rest
    }: ImplAlertProps<C>,
    ref: React.Ref<any>,
) => {
    const [visible, setVisible] = useState(true);

    const renderIcon = useCallback(() => {
        if (!icon) return null;

        if (icon === true) {
            return defaultIcons[intent]; // your internal mapping
        }

        return icon; // custom node
    }, [icon, intent]);

    if (!visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    // const resolvedIcon = icon ?? defaultIcons[intent];
    const resolvedIcon = renderIcon();

    return (
        <Box
            {...rest}
            className={clsx(prefix(), className)}
            direction="row"
            rounded={rounded}
            ref={ref}
            data-intent={intent}
            data-variant={variant}
            data-size={size}
        >
            {resolvedIcon != null && <Box className={prefix(`__icon`)}>{resolvedIcon}</Box>}

            <Box className={prefix(`__content`)}>{children}</Box>
        </Box>
    );
};

export const Alert = createPolymorphic<OwnAlertProps, 'div'>(forwardRef(AlertImpl), 'Alert');
