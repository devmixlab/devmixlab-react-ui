import React, { forwardRef, useState } from 'react';
import { createPolymorphic, type PolymorphicComponent } from '../types/polymorphic';
import { type BoxProps } from '../Components/Box/Box';
import { Card } from '../Card';
import { type CardProps } from '../Card/Card';
import { Box } from '../Components/Box/Box';
import { CLASS_PREFIX } from '../constants';
import clsx from 'clsx';
import { Info, Warning, Success, Close } from '../Icon';
import { Density } from '../Card/card.tokens';
import { sizeToDensityMap, Intent, Variant, Size } from './alert.tokens';
import { Button } from '../Components/Button/Button';

export const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--alert${name}`;
};

type AlertProps = {
    children: React.ReactNode;
    intent?: Intent;
    variant?: Variant;
    size?: Size;
    className?: string;
    icon?: boolean | React.ReactNode;

    dismissible?: boolean;
    onDismiss?: () => void;
} & Omit<CardProps, 'size'>;

const defaultIcons: Record<Intent, React.ReactNode> = {
    primary: null,
    secondary: null,
    success: <Success />,
    warning: <Warning />,
    danger: <Warning />,
    info: <Info />,
};

const AlertImpl = (
    {
        children,
        intent = 'primary',
        variant = 'base',
        size = 'md',
        className,
        icon,
        dismissible,
        onDismiss,
        ...rest
    }: AlertProps,
    ref: React.Ref<any>,
) => {
    const [visible, setVisible] = useState(true);

    const density = sizeToDensityMap[size];

    const renderIcon = () => {
        if (!icon) return null;

        if (icon === true) {
            return defaultIcons[intent]; // your internal mapping
        }

        return icon; // custom node
    };

    if (!visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    // const resolvedIcon = icon ?? defaultIcons[intent];
    const resolvedIcon = renderIcon();

    return (
        <Card
            className={clsx(prefix(), className)}
            density={density}
            direction="row"
            rounded="md"
            ref={ref}
            data-intent={intent}
            data-variant={variant}
            data-size={size}
            {...rest}
        >
            <Card.Section density="none" d="flex" gap={size} flex="1" px={size}>
                {resolvedIcon != null && (
                    // <Card.Media pl={2} mr={0} centerY justify="right">
                    //     <Card.Media.Icon size="md" justify="right" w={30}>
                    //         {resolvedIcon}
                    //     </Card.Media.Icon>
                    // </Card.Media>
                    <Card.Section
                        pt={size}
                        pl={size}
                        className={prefix(`__icon`)}
                        density="none"
                        centerX
                    >
                        <Box mt="2px">{resolvedIcon}</Box>
                    </Card.Section>
                )}

                {/*<Card.Body pos="relative">*/}
                <Card.Section border="none" density="none" py={size} grow={1} flex={1}>
                    {children}
                </Card.Section>

                {dismissible && (
                    <Card.Section
                        d="flex"
                        justify="center"
                        align="centner"
                        pt={size}
                        density="none"
                    >
                        <Button
                            onClick={handleDismiss}
                            variant="ghost"
                            intent={intent}
                            iconOnly
                            size="xs"
                        >
                            <Close />
                        </Button>
                        {/*<Box mt="2px">*/}
                        {/*    <Box*/}
                        {/*        as="button"*/}
                        {/*        rounded="xs"*/}
                        {/*        // size={26}*/}
                        {/*        onClick={handleDismiss}*/}
                        {/*        aria-label="Close alert"*/}
                        {/*        className={prefix('__dismiss-button')}*/}
                        {/*    >*/}
                        {/*        <span className={prefix('__dismiss-icon')}>*/}
                        {/*            <Close />*/}
                        {/*        </span>*/}
                        {/*    </Box>*/}
                        {/*</Box>*/}
                    </Card.Section>
                )}
            </Card.Section>
            {/*</Card.Body>*/}
        </Card>
    );
};

export const Alert = createPolymorphic<AlertProps, 'div'>(forwardRef(AlertImpl), 'Alert');
