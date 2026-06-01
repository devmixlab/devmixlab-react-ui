import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Size, Intent, Variant } from './Button.tokens';
import { Box, type BoxProps } from '../Box/Box';
import { CLASS_PREFIX } from '../constants';
import { createPolymorphic } from '../types/polymorphic';

type GroupProps = {
    className?: string;
    children: React.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    variant?: Variant;
    intent?: Intent;
    size?: Size;
    rounded?: BoxProps['rounded'];
    disabled?: boolean;
    fullWidth?: boolean;
    equalWidth?: boolean;
};

const prefix = (name: string = '') => {
    return `${CLASS_PREFIX}--button-group${name}`;
};

const GroupImpl = (
    {
        className,
        children,
        orientation = 'horizontal',
        variant = 'base',
        intent = 'primary',
        size = 'md',
        rounded = 'sm',
        disabled = false,
        fullWidth = false,
        equalWidth = false,
        ...rest
    }: GroupProps,
    ref: React.Ref<any>,
) => {
    const items = React.Children.toArray(children).filter(React.isValidElement);

    const isFullNotAllowed = orientation === 'vertical' && rounded === 'full';
    const finalRounded = isFullNotAllowed ? 'sm' : rounded;

    return (
        <Box
            ref={ref}
            role="group"
            className={clsx(prefix(), className)}
            {...rest}
            data-orientation={orientation}
            data-full-width={fullWidth || undefined}
            data-equal-width={equalWidth || undefined}
        >
            {items.map((child: React.ReactElement<any>, index: number) => {
                const roundedLeft = orientation === 'horizontal' && index == 0 && finalRounded;
                const roundedRight =
                    orientation === 'horizontal' && index == items.length - 1 && finalRounded;
                const roundedTop = orientation === 'vertical' && index == 0 && finalRounded;
                const roundedBottom =
                    orientation === 'vertical' && index == items.length - 1 && finalRounded;

                return React.cloneElement(child, {
                    ...child.props,
                    key: child.key ?? `group-item-${index}`,
                    // groupItem: true,
                    disabled: child.props.disabled ?? disabled,
                    intent: child.props.intent ?? intent ?? 'primary',
                    variant: child.props.variant ?? variant ?? 'base',
                    size: child.props.size ?? size ?? 'md',
                    rounded: 'none',
                    roundedLeft: roundedLeft,
                    roundedRight: roundedRight,
                    roundedTop: roundedTop,
                    roundedBottom: roundedBottom,
                    w: child.props.w ?? (orientation === 'vertical' ? 'full' : undefined),
                    width: child.props.width ?? (orientation === 'vertical' ? 'full' : undefined),
                });
            })}
        </Box>
    );
};

export const Group = createPolymorphic<GroupProps, 'div'>(forwardRef(GroupImpl), 'ButtonGroup');

export type { GroupProps };
